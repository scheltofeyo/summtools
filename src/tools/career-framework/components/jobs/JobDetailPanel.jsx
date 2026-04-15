import { useState, useEffect } from 'react'

export default function JobDetailPanel({ job, growthPaths, domains, phases, jobs, onUpdate, onDelete, onClose }) {
  const [name, setName] = useState(job.name)
  const [growthPathId, setGrowthPathId] = useState(job.growthPathId || '')
  const [domainId, setDomainId] = useState(job.domainId || '')
  const [culturalPhaseId, setCulturalPhaseId] = useState(job.culturalPhaseId || '')
  const [rankInGp, setRankInGp] = useState(job.rankInGp || '')
  const [mission, setMission] = useState(job.mission || '')
  const [salary, setSalary] = useState(job.salary || '')
  const [reportsTo, setReportsTo] = useState(job.reportsTo || '')
  const [experienceLevel, setExperienceLevel] = useState(job.experienceLevel || '')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)

  useEffect(() => {
    setName(job.name)
    setGrowthPathId(job.growthPathId || '')
    setDomainId(job.domainId || '')
    setCulturalPhaseId(job.culturalPhaseId || '')
    setRankInGp(job.rankInGp || '')
    setMission(job.mission || '')
    setSalary(job.salary || '')
    setReportsTo(job.reportsTo || '')
    setExperienceLevel(job.experienceLevel || '')
  }, [job.id])

  async function handleSave() {
    try {
      setSaving(true)
      await onUpdate({
        name: name.trim(),
        growthPathId: growthPathId || null,
        domainId: domainId || null,
        culturalPhaseId: culturalPhaseId || null,
        rankInGp: rankInGp ? parseInt(rankInGp) : null,
        mission: mission.trim() || null,
        salary: salary.trim() || null,
        reportsTo: reportsTo.trim() || null,
        experienceLevel: experienceLevel.trim() || null,
      })
      setSaveMsg('Opgeslagen')
      setTimeout(() => setSaveMsg(null), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-brand transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Terug naar overzicht
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Job naam</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Growth Path</label>
            <select
              value={growthPathId}
              onChange={(e) => setGrowthPathId(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:border-brand outline-none"
            >
              <option value="">Standalone (geen pad)</option>
              {growthPaths.map((gp) => (
                <option key={gp.id} value={gp.id}>{gp.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Rank in pad</label>
            <input
              type="number"
              value={rankInGp}
              onChange={(e) => setRankInGp(e.target.value)}
              min={1}
              placeholder="bijv. 1, 2, 3..."
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:border-brand outline-none"
              disabled={!growthPathId}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Cultural Phase</label>
            <select
              value={culturalPhaseId}
              onChange={(e) => setCulturalPhaseId(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:border-brand outline-none"
            >
              <option value="">Geen</option>
              {phases.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Domein</label>
            <select
              value={domainId}
              onChange={(e) => setDomainId(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:border-brand outline-none"
            >
              <option value="">Geen</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <hr className="border-neutral-100" />

        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Job Mission</label>
          <textarea
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            rows={3}
            placeholder="Beschrijf het doel van deze rol..."
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:border-brand outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Salaris</label>
            <input
              type="text"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="bijv. € 3.200 - 4.000"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:border-brand outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Experience level</label>
            <input
              type="text"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              placeholder="bijv. 1-3 jaar"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:border-brand outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Reports to</label>
          <input
            type="text"
            value={reportsTo}
            onChange={(e) => setReportsTo(e.target.value)}
            placeholder="bijv. Senior Advocaat"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:border-brand outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          <button
            onClick={() => { if (confirm('Job verwijderen?')) onDelete() }}
            className="text-xs text-neutral-400 hover:text-error transition-colors"
          >
            Job verwijderen
          </button>
          <div className="flex items-center gap-3">
            {saveMsg && <span className="text-xs text-success">{saveMsg}</span>}
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors"
            >
              {saving ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
