import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { getSessions, deleteSession, createSession } from './store/sessionStore'
import SessionStatusBadge from './components/SessionStatusBadge'
import Modal from './components/Modal'

const STATUS_FILTERS = [
  { key: 'open', label: 'Open' },
  { key: 'draft', label: 'Concept' },
  { key: 'closed', label: 'Gesloten' },
  { key: 'archived', label: 'Gearchiveerd' },
]

export default function SessionList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState(['open', 'draft'])
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    if (!user) return
    getSessions()
      .then(setSessions)
      .finally(() => setLoading(false))
  }, [user])

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteSession(deleteTarget.id)
    setDeleteTarget(null)
    const updated = await getSessions()
    setSessions(updated)
  }

  async function handleDuplicate(session) {
    const newValues = session.values.map((v) => ({ ...v, id: crypto.randomUUID() }))
    const copy = await createSession({
      title: session.title,
      description: session.description,
      values: newValues,
      createdBy: user.id,
    })
    navigate(`/tools/ranking-the-values/${copy.id}/bewerken`)
  }

  function toggleFilter(key) {
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    )
  }

  const visibleSessions = activeFilters.length === 0
    ? sessions
    : sessions.filter((s) => activeFilters.includes(s.status))

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Ranking the Values</h1>
          <p className="text-neutral-500 mt-1">Beheer je sessies en bekijk resultaten.</p>
        </div>
        <Link
          to="/tools/ranking-the-values/nieuw"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-lg font-medium text-sm hover:bg-brand-dark transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nieuwe sessie
        </Link>
      </div>

      {sessions.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          {STATUS_FILTERS.map(({ key, label }) => {
            const active = activeFilters.includes(key)
            const count = sessions.filter((s) => s.status === key).length
            if (count === 0) return null
            return (
              <button
                key={key}
                onClick={() => toggleFilter(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand/10 text-brand border border-brand/20'
                    : 'bg-neutral-50 text-neutral-400 border border-transparent hover:bg-neutral-100 hover:text-neutral-600'
                }`}
              >
                {label}
                <span className={`text-xs ${active ? 'text-brand/60' : 'text-neutral-300'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-neutral-200">
          <div className="w-12 h-12 bg-brand-lightest rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
          </div>
          <p className="text-neutral-600 font-medium">Nog geen sessies</p>
          <p className="text-neutral-400 text-sm mt-1">Maak je eerste sessie aan om te beginnen.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {visibleSessions.map((session) => (
              <Link
                key={session.id}
                to={`/tools/ranking-the-values/${session.id}`}
                className={`group block bg-white rounded-xl border border-neutral-200 hover:border-brand/30 hover:shadow-md transition-all ${
                  session.status === 'archived' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center justify-between p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-base font-semibold text-neutral-800 group-hover:text-brand transition-colors truncate">
                        {session.title}
                      </h2>
                      <SessionStatusBadge status={session.status} />
                    </div>
                    {session.description && (
                      <p className="text-sm text-neutral-500 mt-0.5 truncate">{session.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-1 text-sm text-neutral-400">
                      <span>{session.submissionCount} {session.submissionCount === 1 ? 'inzending' : 'inzendingen'}</span>
                      <span>{session.values.length} waarden</span>
                      <span>{new Date(session.createdAt).toLocaleDateString('nl-NL')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleDuplicate(session)
                      }}
                      className="p-2 text-neutral-300 hover:text-brand rounded-lg hover:bg-brand/5 transition-colors"
                      title="Dupliceren"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m0 0a2.625 2.625 0 115.25 0H8.25z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setDeleteTarget(session)
                      }}
                      className="p-2 text-neutral-300 hover:text-error rounded-lg hover:bg-error/5 transition-colors"
                      title="Verwijderen"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                    <svg className="w-5 h-5 text-neutral-300 group-hover:text-brand transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {visibleSessions.length === 0 && (
            <div className="text-center py-8 text-neutral-400 text-sm">
              Geen sessies met deze filters.
            </div>
          )}
        </>
      )}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Sessie verwijderen?">
        <p className="text-sm text-neutral-500 mb-4 leading-relaxed">
          Deze actie kan niet ongedaan worden gemaakt. Het volgende wordt permanent verwijderd:
        </p>
        <ul className="text-sm text-neutral-600 space-y-2 mb-6">
          <li className="flex gap-2">
            <svg className="w-4 h-4 text-error shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            <span>De sessie <strong>"{deleteTarget?.title}"</strong> en alle instellingen</span>
          </li>
          <li className="flex gap-2">
            <svg className="w-4 h-4 text-error shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <span>Alle {deleteTarget?.submissionCount ?? 0} {deleteTarget?.submissionCount === 1 ? 'inzending' : 'inzendingen'} van deelnemers</span>
          </li>
          <li className="flex gap-2">
            <svg className="w-4 h-4 text-error shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
            <span>Alle {deleteTarget?.values?.length ?? 0} waarden en rankings</span>
          </li>
        </ul>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteTarget(null)}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-error rounded-lg hover:bg-red-700 transition-colors"
          >
            Verwijderen
          </button>
        </div>
      </Modal>
    </div>
  )
}
