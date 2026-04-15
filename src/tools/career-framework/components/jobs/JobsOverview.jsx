import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFramework } from '../../FrameworkEditor'
import { getGrowthPaths, createGrowthPath, deleteGrowthPath } from '../../store/growthPathStore'
import { getJobs, createJob, updateJob, deleteJob } from '../../store/jobStore'
import { getDomains } from '../../store/domainStore'
import { getCulturalPhases } from '../../store/culturalValueStore'
import JobDetailPanel from './JobDetailPanel'

export default function JobsOverview() {
  const { framework } = useFramework()
  const navigate = useNavigate()
  const [growthPaths, setGrowthPaths] = useState([])
  const [jobs, setJobs] = useState([])
  const [domains, setDomains] = useState([])
  const [phases, setPhases] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [filter, setFilter] = useState('all') // 'all' | gpId | 'standalone'

  useEffect(() => {
    loadData()
  }, [framework.id])

  async function loadData() {
    try {
      const [gps, j, d, p] = await Promise.all([
        getGrowthPaths(framework.id),
        getJobs(framework.id),
        getDomains(framework.id),
        getCulturalPhases(framework.id),
      ])
      setGrowthPaths(gps)
      setJobs(j)
      setDomains(d)
      setPhases(p)
    } catch (err) {
      console.error('Failed to load jobs data:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddGrowthPath() {
    const name = prompt('Naam van het growth path:')
    if (!name?.trim()) return
    try {
      const gp = await createGrowthPath({ frameworkId: framework.id, name: name.trim(), sortOrder: growthPaths.length })
      setGrowthPaths((prev) => [...prev, gp])
    } catch (err) {
      console.error('Failed to create growth path:', err)
    }
  }

  async function handleDeleteGrowthPath(gpId) {
    if (!confirm('Growth path verwijderen? Gekoppelde jobs worden standalone.')) return
    try {
      await deleteGrowthPath(gpId)
      setGrowthPaths((prev) => prev.filter((gp) => gp.id !== gpId))
      setJobs((prev) => prev.map((j) => j.growthPathId === gpId ? { ...j, growthPathId: null, rankInGp: null } : j))
    } catch (err) {
      console.error('Failed to delete growth path:', err)
    }
  }

  async function handleAddJob(growthPathId = null) {
    const name = prompt('Naam van de job:')
    if (!name?.trim()) return
    try {
      const gpJobs = growthPathId ? jobs.filter((j) => j.growthPathId === growthPathId) : []
      const job = await createJob({
        frameworkId: framework.id,
        growthPathId,
        name: name.trim(),
        rankInGp: growthPathId ? gpJobs.length + 1 : null,
      })
      setJobs((prev) => [...prev, job])
    } catch (err) {
      console.error('Failed to create job:', err)
    }
  }

  async function handleUpdateJob(id, updates) {
    try {
      const updated = await updateJob(id, updates)
      setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)))
      return updated
    } catch (err) {
      console.error('Failed to update job:', err)
    }
  }

  async function handleDeleteJob(id) {
    try {
      await deleteJob(id)
      setJobs((prev) => prev.filter((j) => j.id !== id))
      if (selectedJobId === id) setSelectedJobId(null)
    } catch (err) {
      console.error('Failed to delete job:', err)
    }
  }

  const filteredJobs = filter === 'all'
    ? jobs
    : filter === 'standalone'
      ? jobs.filter((j) => !j.growthPathId)
      : jobs.filter((j) => j.growthPathId === filter)

  const standaloneJobs = jobs.filter((j) => !j.growthPathId)
  const selectedJob = jobs.find((j) => j.id === selectedJobId)

  if (loading) {
    return (
      <div className="flex gap-6">
        <div className="w-64 space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-neutral-100 rounded-xl animate-pulse" />)}
        </div>
        <div className="flex-1 h-64 bg-neutral-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex gap-6">
      {/* Left panel: Growth Paths */}
      <div className="w-64 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-neutral-700">Growth Paths</h2>
          <button
            onClick={handleAddGrowthPath}
            className="p-1 text-brand hover:bg-brand-lightest rounded transition-colors"
            title="Nieuw growth path"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>

        <div className="space-y-2">
          {growthPaths.map((gp) => {
            const gpJobs = jobs.filter((j) => j.growthPathId === gp.id).sort((a, b) => (a.rankInGp || 0) - (b.rankInGp || 0))
            return (
              <div key={gp.id} className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-neutral-50">
                  <button
                    onClick={() => navigate(`/tools/career-framework/${framework.id}/gp/${gp.id}`)}
                    className="text-sm font-semibold text-neutral-800 hover:text-brand transition-colors truncate text-left flex-1"
                    title="Open growth path editor"
                  >
                    {gp.name}
                  </button>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-neutral-400 bg-neutral-200 px-1.5 py-0.5 rounded-full">
                      {gpJobs.length}
                    </span>
                    <button
                      onClick={() => handleAddJob(gp.id)}
                      className="p-0.5 text-neutral-400 hover:text-brand transition-colors"
                      title="Job toevoegen aan dit pad"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </button>
                  </div>
                </div>
                {gpJobs.length > 0 && (
                  <div className="px-3 py-1.5">
                    {gpJobs.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => setSelectedJobId(job.id)}
                        className={`w-full text-left text-xs py-1 px-1.5 rounded transition-colors truncate ${
                          selectedJobId === job.id
                            ? 'bg-brand-lightest text-brand font-medium'
                            : 'text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        <span className="text-neutral-400 mr-1.5">{job.rankInGp}.</span>
                        {job.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Standalone jobs */}
          {standaloneJobs.length > 0 && (
            <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-neutral-50">
                <span className="text-sm font-medium text-neutral-500">Standalone</span>
                <span className="text-[10px] text-neutral-400 bg-neutral-200 px-1.5 py-0.5 rounded-full">
                  {standaloneJobs.length}
                </span>
              </div>
              <div className="px-3 py-1.5">
                {standaloneJobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className={`w-full text-left text-xs py-1 px-1.5 rounded transition-colors truncate ${
                      selectedJobId === job.id
                        ? 'bg-brand-lightest text-brand font-medium'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {job.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {growthPaths.length === 0 && standaloneJobs.length === 0 && (
            <div className="text-center py-6">
              <p className="text-xs text-neutral-400 mb-2">Nog geen growth paths.</p>
              <button onClick={handleAddGrowthPath} className="text-xs text-brand hover:underline">
                Maak je eerste pad aan
              </button>
            </div>
          )}
        </div>

        {/* Add standalone job */}
        <button
          onClick={() => handleAddJob(null)}
          className="w-full mt-3 flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:border-brand hover:text-brand transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Standalone job
        </button>
      </div>

      {/* Right panel: Job table or detail */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-neutral-900">Jobs & Growth Paths</h1>
        </div>

        {selectedJob ? (
          <JobDetailPanel
            job={selectedJob}
            growthPaths={growthPaths}
            domains={domains}
            phases={phases}
            jobs={jobs}
            onUpdate={(updates) => handleUpdateJob(selectedJob.id, updates)}
            onDelete={() => handleDeleteJob(selectedJob.id)}
            onClose={() => setSelectedJobId(null)}
          />
        ) : (
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            {/* Filter bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-sm border border-neutral-300 rounded-md px-2 py-1 outline-none focus:border-brand"
              >
                <option value="all">Alle jobs ({jobs.length})</option>
                {growthPaths.map((gp) => (
                  <option key={gp.id} value={gp.id}>
                    {gp.name} ({jobs.filter((j) => j.growthPathId === gp.id).length})
                  </option>
                ))}
                <option value="standalone">Standalone ({standaloneJobs.length})</option>
              </select>
            </div>

            {/* Table */}
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-neutral-500 border-b border-neutral-100">
                  <th className="px-4 py-2.5 font-medium">Naam</th>
                  <th className="px-4 py-2.5 font-medium">Growth Path</th>
                  <th className="px-4 py-2.5 font-medium">Phase</th>
                  <th className="px-4 py-2.5 font-medium">Domein</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-sm text-neutral-400 py-8">
                      Geen jobs gevonden.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => {
                    const gp = growthPaths.find((g) => g.id === job.growthPathId)
                    const phase = phases.find((p) => p.id === job.culturalPhaseId)
                    const domain = domains.find((d) => d.id === job.domainId)
                    return (
                      <tr
                        key={job.id}
                        onClick={() => setSelectedJobId(job.id)}
                        className="border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-2.5 text-sm font-medium text-neutral-800">{job.name}</td>
                        <td className="px-4 py-2.5 text-sm text-neutral-500">{gp?.name || '—'}</td>
                        <td className="px-4 py-2.5">
                          {phase && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                              {phase.name}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-neutral-500">{domain?.name || '—'}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
