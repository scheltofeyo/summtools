import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { getFrameworks, deleteFramework } from './store/frameworkStore'

const STATUS_LABELS = {
  draft: 'Concept',
  active: 'Actief',
  archived: 'Gearchiveerd',
}

const STATUS_COLORS = {
  draft: 'bg-warning-light text-warning',
  active: 'bg-success-light text-success',
  archived: 'bg-neutral-100 text-neutral-500',
}

export default function FrameworkList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [frameworks, setFrameworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    loadFrameworks()
  }, [])

  async function loadFrameworks() {
    try {
      setLoading(true)
      const data = await getFrameworks()
      setFrameworks(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteFramework(deleteId)
      setFrameworks((prev) => prev.filter((f) => f.id !== deleteId))
      setDeleteId(null)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <div className="h-7 w-64 bg-neutral-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-neutral-100 rounded animate-pulse mt-2" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-neutral-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Career Frameworks</h1>
          <p className="text-neutral-500 mt-1">
            Bouw en beheer carriere-frameworks voor klantbedrijven.
          </p>
        </div>
        <Link
          to="/tools/career-framework/nieuw"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nieuw framework
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error-light text-error rounded-lg text-sm">{error}</div>
      )}

      {/* Framework list */}
      {frameworks.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-brand-lightest rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-neutral-800">Nog geen frameworks</h2>
          <p className="text-neutral-500 mt-1 mb-6">Maak je eerste carriere-framework aan.</p>
          <Link
            to="/tools/career-framework/nieuw"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nieuw framework
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {frameworks.map((fw) => (
            <div
              key={fw.id}
              className="group flex items-center justify-between p-5 bg-white rounded-xl border border-neutral-200 hover:border-brand/30 hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(`/tools/career-framework/${fw.id}/setup`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-lightest text-brand rounded-lg flex items-center justify-center font-bold text-sm">
                  {fw.companyName?.charAt(0)?.toUpperCase() || 'F'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-neutral-800 group-hover:text-brand transition-colors">
                      {fw.companyName}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[fw.status]}`}>
                      {STATUS_LABELS[fw.status]}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 mt-0.5">{fw.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">
                  {new Date(fw.updatedAt).toLocaleDateString('nl-NL')}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteId(fw.id)
                  }}
                  className="p-1.5 text-neutral-400 hover:text-error rounded-md hover:bg-error-light transition-colors opacity-0 group-hover:opacity-100"
                  title="Verwijderen"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-neutral-900">Framework verwijderen?</h3>
            <p className="text-sm text-neutral-500 mt-2">
              Dit verwijdert het framework en alle bijbehorende data (jobs, growth paths, skills, medewerkers). Dit kan niet ongedaan worden gemaakt.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-800 transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-error text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
