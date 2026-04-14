import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getSessionById, updateSession, getSubmissionsBySessionId, toCamelSubmission } from './store/sessionStore'
import { supabase } from '../../lib/supabase'
import SessionStatusBadge from './components/SessionStatusBadge'
import ShareLinkCopier from './components/ShareLinkCopier'
import SubmissionsList from './components/SubmissionsList'
import MatchResultsPanel from './components/MatchResultsPanel'
import Modal from './components/Modal'

export default function SessionDetail() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)

  useEffect(() => {
    async function load() {
      const s = await getSessionById(sessionId)
      if (!s) return navigate('/tools/ranking-the-values')
      setSession(s)
      const subs = await getSubmissionsBySessionId(sessionId)
      setSubmissions(subs)
      setLoading(false)
    }
    load()
  }, [sessionId, navigate])

  // Realtime: live submissions when session is open
  useEffect(() => {
    if (!session || session.status !== 'open') return

    const channel = supabase
      .channel(`submissions:${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'submissions',
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          setSubmissions((prev) => [...prev, toCamelSubmission(payload.new)])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'submissions',
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          setSubmissions((prev) =>
            prev.map((s) => s.id === payload.new.id ? toCamelSubmission(payload.new) : s)
          )
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [session?.id, session?.status])

  if (loading || !session) return null

  const isDraft = session.status === 'draft'
  const isOpen = session.status === 'open'
  const isClosed = session.status === 'closed'
  const isArchived = session.status === 'archived'

  async function publishSession() {
    const updated = await updateSession(sessionId, { status: 'open' })
    setSession(updated)
    setShowPublishModal(false)
  }

  async function unpublishSession() {
    const updated = await updateSession(sessionId, { status: 'draft' })
    setSession(updated)
  }

  async function closeSession() {
    const updated = await updateSession(sessionId, { status: 'closed' })
    setSession(updated)
    setShowCloseModal(false)
  }

  async function archiveSession() {
    const updated = await updateSession(sessionId, { status: 'archived' })
    setSession(updated)
  }

  async function unarchiveSession() {
    const updated = await updateSession(sessionId, { status: 'closed' })
    setSession(updated)
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            to="/tools/ranking-the-values"
            className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-brand transition-colors mb-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Alle sessies
          </Link>
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Ranking the Values</p>
          <div className="flex items-center gap-3 mt-0.5">
            <h1 className="text-2xl font-bold text-neutral-900">{session.title}</h1>
            <SessionStatusBadge status={session.status} />
          </div>
          {session.description && (
            <p className="text-neutral-500 mt-0.5">{session.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isDraft && (
            <Link
              to={`/tools/ranking-the-values/${sessionId}/bewerken`}
              className="px-3 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Bewerken
            </Link>
          )}
          {isOpen && submissions.length === 0 && (
            <button
              onClick={unpublishSession}
              className="px-3 py-2 text-sm text-neutral-500 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Terug naar concept
            </button>
          )}
          {isArchived && (
            <button
              onClick={unarchiveSession}
              className="px-3 py-2 text-sm text-neutral-500 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Heractiveren
            </button>
          )}
        </div>
      </div>

      {/* === DRAFT: values overview + publish CTA === */}
      {isDraft && (
        <>
          {/* Values */}
          <section className="bg-white border border-neutral-200 rounded-xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-neutral-700 mb-3">
              Waarden ({session.values.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {session.values.map((v) => (
                <span
                  key={v.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm"
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: v.color }}
                  />
                  {v.title}
                </span>
              ))}
            </div>
          </section>

          {/* Publish CTA */}
          <div className="bg-brand-lightest border border-brand/10 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-neutral-800 mb-1">Klaar om te delen?</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Publiceer de sessie om de deel-link te activeren en deelnemers uit te nodigen.
            </p>
            <button
              onClick={() => setShowPublishModal(true)}
              className="px-5 py-2.5 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors"
            >
              Sessie publiceren
            </button>
          </div>
        </>
      )}

      {/* === OPEN / CLOSED: share link === */}
      {(isOpen || isClosed) && (
        <div className="mb-6">
          <ShareLinkCopier shareCode={session.shareCode} />
        </div>
      )}

      {/* === OPEN: submissions + close CTA === */}
      {isOpen && (
        <>
          <div className="bg-white border border-neutral-200 rounded-xl p-5 mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-700">
                Klaar om te matchen?
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                Sluit de sessie om deelnemers te koppelen. Daarna kan er niet meer ingestuurd worden.
              </p>
            </div>
            <button
              onClick={() => setShowCloseModal(true)}
              className="shrink-0 px-4 py-2 text-sm rounded-lg font-medium transition-colors bg-brand text-white hover:bg-brand-dark"
            >
              Sessie sluiten &amp; matchen
            </button>
          </div>

          <section className="bg-white border border-neutral-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-neutral-700 mb-3">
              Deelnemers ({submissions.length})
            </h2>
            <SubmissionsList submissions={submissions} values={session.values} />
          </section>
        </>
      )}

      {/* === CLOSED / ARCHIVED: matches + archive CTA === */}
      {(isClosed || isArchived) && (
        <>
          {isClosed && (
            <div className="bg-white border border-neutral-200 rounded-xl p-5 mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-neutral-700">
                  Sessie afronden?
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Archiveer de sessie om het overzicht opgeruimd te houden.
                </p>
              </div>
              <button
                onClick={archiveSession}
                className="shrink-0 px-4 py-2 text-sm rounded-lg font-medium transition-colors bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              >
                Archiveren
              </button>
            </div>
          )}

          <section className="bg-brand-lightest border border-brand/10 rounded-xl p-5">
            <MatchResultsPanel submissions={submissions} values={session.values} />
          </section>
        </>
      )}

      {/* Publish confirmation modal */}
      <Modal open={showPublishModal} onClose={() => setShowPublishModal(false)} title="Sessie publiceren?">
        <p className="text-sm text-neutral-500 mb-4 leading-relaxed">
          Na publicatie gebeurt het volgende:
        </p>
        <ul className="text-sm text-neutral-600 space-y-2 mb-6">
          <li className="flex gap-2">
            <svg className="w-4 h-4 text-success shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 1 1-6.364-6.364l1.757-1.757m9.968-3.684a4.5 4.5 0 0 0-1.242-7.244l-4.5-4.5a4.5 4.5 0 0 0-6.364 6.364L4.34 8.374" />
            </svg>
            <span>De deel-link wordt actief — deelnemers kunnen hun ranking invullen</span>
          </li>
          <li className="flex gap-2">
            <svg className="w-4 h-4 text-warning shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span>Titel, beschrijving en waarden kunnen niet meer worden gewijzigd</span>
          </li>
        </ul>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPublishModal(false)}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={publishSession}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors"
          >
            Publiceren
          </button>
        </div>
      </Modal>

      {/* Close confirmation modal */}
      <Modal open={showCloseModal} onClose={() => setShowCloseModal(false)} title="Sessie sluiten?">
        <p className="text-sm text-neutral-500 mb-4 leading-relaxed">
          Na het sluiten gebeurt het volgende:
        </p>
        <ul className="text-sm text-neutral-600 space-y-2 mb-6">
          <li className="flex gap-2">
            <svg className="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <span>Deelnemers worden automatisch gematched op basis van tegengestelde waarden</span>
          </li>
          <li className="flex gap-2">
            <svg className="w-4 h-4 text-warning shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span>Niemand kan meer een ranking insturen</span>
          </li>
        </ul>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCloseModal(false)}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={closeSession}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors"
          >
            Sluiten &amp; matchen
          </button>
        </div>
      </Modal>
    </div>
  )
}
