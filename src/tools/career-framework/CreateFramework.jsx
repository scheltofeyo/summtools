import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { createFramework } from './store/frameworkStore'
import { createCulturalPhase } from './store/culturalValueStore'

const DEFAULT_PHASES = [
  { name: 'Operational', description: 'Cultivate ownership of cultural values and your own professional development.', sortOrder: 0 },
  { name: 'Tactical', description: 'Incentivise making more impact within the team with increasing independence.', sortOrder: 1 },
  { name: 'Strategic', description: 'Inspire and nurture a culture of personal development, courage and openness.', sortOrder: 2 },
]

export default function CreateFramework() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [companyName, setCompanyName] = useState('')
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!companyName.trim()) return

    try {
      setSaving(true)
      const framework = await createFramework({
        name: name.trim() || `${companyName.trim()} — Career Framework`,
        companyName: companyName.trim(),
        createdBy: user.id,
      })

      // Create default cultural phases
      for (const phase of DEFAULT_PHASES) {
        await createCulturalPhase({ frameworkId: framework.id, ...phase })
      }

      navigate(`/tools/career-framework/${framework.id}/setup`)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-neutral-400 mb-6">
        <Link to="/tools/career-framework" className="hover:text-brand transition-colors">
          Career Frameworks
        </Link>
        <span>/</span>
        <span className="text-neutral-600">Nieuw</span>
      </div>

      <h1 className="text-2xl font-bold text-neutral-900 mb-1">Nieuw framework</h1>
      <p className="text-neutral-500 mb-8">
        Start een nieuw carriere-framework voor een klantbedrijf.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-error-light text-error rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Bedrijfsnaam *
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="bijv. Advocatenkantoor De Vries"
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Framework naam
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={companyName ? `${companyName} — Career Framework` : 'Wordt automatisch ingevuld'}
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors"
          />
          <p className="text-xs text-neutral-400 mt-1">Optioneel. Handig als een bedrijf meerdere frameworks heeft.</p>
        </div>

        <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600 mb-1">Standaard cultural phases</p>
          <p className="text-xs text-neutral-400">
            De drie standaard fasen (Operational, Tactical, Strategic) worden automatisch aangemaakt. Je kunt deze later aanpassen.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!companyName.trim() || saving}
            className="px-5 py-2.5 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Aanmaken...' : 'Framework aanmaken'}
          </button>
          <Link
            to="/tools/career-framework"
            className="px-4 py-2.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Annuleren
          </Link>
        </div>
      </form>
    </div>
  )
}
