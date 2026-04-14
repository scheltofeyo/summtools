import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  getSessionByShareCode,
  getSubmissionByEmail,
  getSubmissionsBySessionId,
  createPendingSubmission,
  completeSubmission,
  toCamelSession,
} from './store/sessionStore'
import { supabase } from '../../lib/supabase'
import { findBalancedPairs, normalizeDistance } from './utils/matching'
import ValueRankingList from './components/ValueRankingList'

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

const STEPS = [
  { label: 'Gegevens' },
  { label: 'Ranking' },
  { label: 'Match' },
]

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center w-full max-w-xs mx-auto mb-8" aria-label="Voortgang">
      {STEPS.map((step, i) => {
        const stepNum = i + 1
        const isCompleted = stepNum < currentStep
        const isActive = stepNum === currentStep

        return (
          <div key={stepNum} className="flex items-center flex-1 last:flex-none">
            {/* Circle + label */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isCompleted
                    ? 'bg-brand text-white'
                    : isActive
                      ? 'border-2 border-brand text-brand bg-white'
                      : 'bg-neutral-100 text-neutral-400'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`text-xs mt-1 whitespace-nowrap ${
                  isActive ? 'font-medium text-brand' : 'text-neutral-400'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connecting line */}
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 mt-[-1rem] ${
                  stepNum < currentStep ? 'bg-brand' : 'bg-neutral-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 1 — Naam en e-mail
// ---------------------------------------------------------------------------

function StepIdentification({ name, setName, email, setEmail, error, onContinue }) {
  return (
    <div className="space-y-5">
      <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Naam <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Je volledige naam"
            className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-2 focus:outline-brand"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            E-mailadres <span className="text-error">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="je@voorbeeld.nl"
            className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-2 focus:outline-brand"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-sm text-error">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={onContinue}
        className="w-full py-3 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-dark transition-colors"
      >
        Volgende
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 2 — Ranking
// ---------------------------------------------------------------------------

function StepRanking({ session, order, setOrder, submitting, error, onSubmit }) {
  return (
    <div className="space-y-5">
      <div className="bg-brand-lightest border border-brand/10 rounded-xl p-4">
        <p className="text-sm text-neutral-700">
          <strong>Rangschik de waarden</strong> van het meest naar het minst van toepassing op jou.
          Sleep de waarden in de volgorde die het beste bij je past.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-success">Meest van toepassing</span>
        </div>
        <ValueRankingList
          values={session.values}
          order={order}
          onReorder={setOrder}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-medium text-error">Minst van toepassing</span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-sm text-error">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="w-full py-3 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Bezig met opslaan...' : 'Ranking indienen'}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 3 — Je match
// ---------------------------------------------------------------------------

function StepMatch({ shareCode, session: initialSession, submission }) {
  const [session, setSession] = useState(initialSession)
  const [submissions, setSubmissions] = useState(null)

  // Realtime: listen for session status change (closed)
  useEffect(() => {
    if (session.status === 'closed') return

    const channel = supabase
      .channel(`session-status:${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${session.id}`,
        },
        (payload) => {
          if (payload.new.status === 'closed') {
            setSession(toCamelSession(payload.new))
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [session.id, session.status])

  // Fetch submissions when session is closed
  useEffect(() => {
    if (session.status !== 'closed') return
    getSubmissionsBySessionId(session.id).then(setSubmissions)
  }, [session.id, session.status])

  // Waiting state — session still open
  if (session.status !== 'closed') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-brand-lightest rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-brand animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Bedankt voor je inzending!</h2>
        <p className="text-neutral-500 leading-relaxed mb-4">
          Je ranking is opgeslagen. We wachten tot de begeleider de sessie sluit.
        </p>
        <div className="bg-brand-lightest border border-brand/10 rounded-xl p-4">
          <p className="text-sm text-neutral-600">
            <strong>Sluit dit scherm niet.</strong> Je match verschijnt hier automatisch zodra de resultaten beschikbaar zijn.
          </p>
        </div>
      </div>
    )
  }

  // Loading submissions
  if (!submissions) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Session is closed — compute and show match
  const { myPair, isUnmatched } = (() => {
    const completed = submissions.filter((s) => s.status !== 'in_progress')
    if (completed.length < 2) return { myPair: null, isUnmatched: false }

    const { pairs, unmatched } = findBalancedPairs(completed)

    if (unmatched && unmatched.id === submission.id) {
      return { myPair: null, isUnmatched: true }
    }

    const pair = pairs.find(
      (p) => p.participant1.id === submission.id || p.participant2.id === submission.id
    )
    return { myPair: pair || null, isUnmatched: false }
  })()

  const valueMap = Object.fromEntries(session.values.map((v) => [v.id, v]))

  // Not enough participants
  if (submissions.length < 2) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-neutral-900 mb-2">Niet genoeg deelnemers</h2>
        <p className="text-neutral-500 text-sm">Er zijn minimaal 2 deelnemers nodig om matches te berekenen.</p>
      </div>
    )
  }

  // Participant is unmatched (odd count)
  if (isUnmatched) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-neutral-900 mb-2">Geen match gevonden</h2>
        <p className="text-neutral-500 text-sm leading-relaxed">
          Door een oneven aantal deelnemers heb je helaas geen match gekregen.
          De begeleider kan je alsnog koppelen.
        </p>
      </div>
    )
  }

  // No pair found (shouldn't happen, but handle gracefully)
  if (!myPair) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-500 text-sm">Er kon geen match berekend worden.</p>
      </div>
    )
  }

  // Determine which side is "me" and which is "partner"
  const isMe1 = myPair.participant1.id === submission.id
  const me = isMe1 ? myPair.participant1 : myPair.participant2
  const partner = isMe1 ? myPair.participant2 : myPair.participant1
  const oppositionPct = normalizeDistance(myPair.distance, session.values.length)

  return (
    <div className="space-y-5">
      {/* Match header */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 text-center">
        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-4">
          Jouw tegenpool
        </p>

        {/* Avatars */}
        <div className="flex justify-center mb-4">
          <div className="flex -space-x-3">
            <div className="w-12 h-12 bg-brand-lightest text-brand rounded-full flex items-center justify-center text-lg font-semibold ring-2 ring-white">
              {me.participantName.charAt(0).toUpperCase()}
            </div>
            <div className="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center text-lg font-semibold ring-2 ring-white">
              {partner.participantName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Names */}
        <p className="text-sm text-neutral-800">
          <span className="font-medium">{me.participantName}</span>
          <span className="text-neutral-400 mx-1.5">&</span>
          <span className="font-medium">{partner.participantName}</span>
        </p>

        {/* Opposition score */}
        <div className="mt-4">
          <span className="text-3xl font-bold text-brand">{oppositionPct}%</span>
          <p className="text-xs text-neutral-400 mt-1">tegengesteld</p>
        </div>

        {/* Opposition bar */}
        <div className="mt-4 w-full bg-neutral-100 rounded-full h-2">
          <div
            className="bg-brand h-2 rounded-full transition-all"
            style={{ width: `${oppositionPct}%` }}
          />
        </div>
      </div>

      {/* Side-by-side rankings */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-neutral-700 mb-4">Jullie rankings vergeleken</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[me, partner].map((participant) => (
            <div key={participant.id}>
              <p className="text-xs font-medium text-neutral-400 mb-2">
                {participant.id === submission.id ? 'Jij' : participant.participantName}
              </p>
              <ol className="space-y-1.5">
                {participant.rankings.map((valueId, j) => {
                  const v = valueMap[valueId]
                  if (!v) return null
                  return (
                    <li key={valueId} className="flex items-center gap-2 text-sm">
                      <span className="w-5 text-neutral-400 text-xs text-right">{j + 1}.</span>
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: v.color }}
                      />
                      <span className="text-neutral-600">{v.title}</span>
                    </li>
                  )
                })}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function PublicRankingForm() {
  const { shareCode } = useParams()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  // Step state
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  // Step 2
  const [order, setOrder] = useState([])
  const [submitting, setSubmitting] = useState(false)

  // Step 2 → 3 bridge
  const [pendingSubmissionId, setPendingSubmissionId] = useState(null)

  // Step 3
  const [existingSubmission, setExistingSubmission] = useState(null)

  // Shared
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      const s = await getSessionByShareCode(shareCode)
      setSession(s)
      if (s) {
        setOrder(s.values.map((v) => v.id))
      }
      setLoading(false)
    }
    load()
  }, [shareCode])

  if (loading) return null

  // Session not found
  if (!session) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-neutral-900 mb-2">Sessie niet gevonden</h1>
        <p className="text-neutral-500">Controleer of je de juiste link hebt ontvangen van je begeleider.</p>
      </div>
    )
  }

  // Session not yet published
  if (session.status === 'draft') {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 bg-info/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-neutral-900 mb-2">Deze sessie is nog niet gestart</h1>
        <p className="text-neutral-500">De begeleider is de sessie nog aan het voorbereiden. Probeer het later opnieuw.</p>
      </div>
    )
  }

  // Session archived
  if (session.status === 'archived') {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-neutral-900 mb-2">Deze sessie is niet meer beschikbaar</h1>
        <p className="text-neutral-500">Deze sessie is gearchiveerd door de begeleider.</p>
      </div>
    )
  }

  // --- Step handlers ---

  async function handleStep1Continue() {
    setError(null)

    if (!name.trim() || !email.trim()) {
      setError('Vul je naam en e-mailadres in.')
      return
    }

    const existing = await getSubmissionByEmail(session.id, email.trim())

    if (existing) {
      if (existing.status === 'in_progress') {
        // Resume in-progress submission
        setPendingSubmissionId(existing.id)
        setCurrentStep(2)
      } else {
        // Completed submission → go to step 3
        setExistingSubmission(existing)
        setCurrentStep(3)
      }
    } else {
      if (session.status === 'closed') {
        setError('Deze sessie is gesloten. Je kunt helaas niet meer deelnemen.')
      } else {
        // Create pending submission so facilitator sees this participant
        const pending = await createPendingSubmission({
          sessionId: session.id,
          participantName: name.trim(),
          participantEmail: email.trim(),
        })
        if (pending.error) {
          setError(pending.error)
          return
        }
        setPendingSubmissionId(pending.id)
        setCurrentStep(2)
      }
    }
  }

  async function handleStep2Submit() {
    setError(null)

    // Re-check session status (might have been closed while filling in)
    const freshSession = await getSessionByShareCode(shareCode)
    if (!freshSession || freshSession.status === 'closed') {
      setError('De sessie is inmiddels gesloten. Je ranking kon niet meer worden ingediend.')
      return
    }

    setSubmitting(true)
    const result = await completeSubmission(pendingSubmissionId, order)

    if (result.error) {
      setError(result.error)
      setSubmitting(false)
      return
    }

    setExistingSubmission(result)
    setSubmitting(false)
    setCurrentStep(3)
  }

  return (
    <div className="max-w-md mx-auto py-8">
      {/* Session header */}
      <div className="text-center mb-6">
        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Ranking the Values</p>
        <h1 className="text-2xl font-bold text-neutral-900 mt-1">{session.title}</h1>
        {session.description && (
          <p className="text-neutral-500 text-sm mt-0.5">{session.description}</p>
        )}
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Step content */}
      {currentStep === 1 && (
        <StepIdentification
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          error={error}
          onContinue={handleStep1Continue}
        />
      )}

      {currentStep === 2 && (
        <StepRanking
          session={session}
          order={order}
          setOrder={setOrder}
          submitting={submitting}
          error={error}
          onSubmit={handleStep2Submit}
        />
      )}

      {currentStep === 3 && existingSubmission && (
        <StepMatch
          shareCode={shareCode}
          session={session}
          submission={existingSubmission}
        />
      )}
    </div>
  )
}
