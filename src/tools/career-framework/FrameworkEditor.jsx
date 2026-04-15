import { useState, useEffect, createContext, useContext } from 'react'
import { useParams, Outlet, Link, useLocation } from 'react-router-dom'
import { getFrameworkById } from './store/frameworkStore'
import FrameworkSidebar from './components/FrameworkSidebar'

const FrameworkContext = createContext(null)

export function useFramework() {
  const ctx = useContext(FrameworkContext)
  if (!ctx) throw new Error('useFramework must be used within FrameworkEditor')
  return ctx
}

export default function FrameworkEditor() {
  const { frameworkId } = useParams()
  const [framework, setFramework] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadFramework()
  }, [frameworkId])

  async function loadFramework() {
    try {
      setLoading(true)
      const data = await getFrameworkById(frameworkId)
      if (!data) {
        setError('Framework niet gevonden')
        return
      }
      setFramework(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex gap-6">
        <div className="w-56 shrink-0">
          <div className="h-8 w-40 bg-neutral-200 rounded animate-pulse mb-6" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-8 w-full bg-neutral-100 rounded animate-pulse mb-2" />
          ))}
        </div>
        <div className="flex-1">
          <div className="h-8 w-64 bg-neutral-200 rounded animate-pulse mb-4" />
          <div className="h-48 bg-neutral-100 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-error mb-4">{error}</p>
        <Link to="/tools/career-framework" className="text-brand hover:underline text-sm">
          Terug naar overzicht
        </Link>
      </div>
    )
  }

  return (
    <FrameworkContext.Provider value={{ framework, setFramework, reloadFramework: loadFramework }}>
      <div className="flex gap-6 min-h-[calc(100vh-8rem)]">
        <FrameworkSidebar framework={framework} />
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </FrameworkContext.Provider>
  )
}
