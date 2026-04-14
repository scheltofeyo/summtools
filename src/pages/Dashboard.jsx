import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const TOOLS = [
  {
    id: 'ranking-the-values',
    name: 'Ranking the Values',
    description: 'Laat deelnemers waarden rangschikken en koppel ze aan hun meest tegengestelde match.',
    path: '/tools/ranking-the-values',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
  },
]

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">
          Welkom terug, {user?.name}
        </h1>
        <p className="text-neutral-500 mt-1">
          Kies een tool om te beginnen.
        </p>
      </div>

      {/* Tool cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {TOOLS.map(tool => (
          <Link
            key={tool.id}
            to={tool.path}
            className="group block p-6 bg-white rounded-xl border border-neutral-200 hover:border-brand/30 hover:shadow-lg transition-all"
          >
            <div className="w-10 h-10 bg-brand-lightest text-brand rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand group-hover:text-white transition-colors">
              {tool.icon}
            </div>
            <h2 className="text-base font-semibold text-neutral-800 group-hover:text-brand transition-colors">
              {tool.name}
            </h2>
            <p className="text-neutral-500 mt-1.5 text-sm leading-relaxed">
              {tool.description}
            </p>
          </Link>
        ))}

        {/* Empty state */}
        <div className="flex items-center justify-center p-6 rounded-xl border-2 border-dashed border-neutral-200 text-center">
          <div>
            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-400">Meer tools volgen</p>
            <p className="text-xs text-neutral-300 mt-0.5">Binnenkort beschikbaar</p>
          </div>
        </div>
      </div>
    </div>
  )
}
