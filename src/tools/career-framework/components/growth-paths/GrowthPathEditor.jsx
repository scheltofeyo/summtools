import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useFramework } from '../../FrameworkEditor'
import { getJobsByGrowthPath, createJob } from '../../store/jobStore'
import { getGrowthPathSkills, addSkillToGrowthPath, removeSkillFromGrowthPath, upsertSkillLevelDescription } from '../../store/skillStore'
import { getSkills, getSkillThemes, createSkill, createSkillTheme } from '../../store/skillStore'
import { getCulturalPhases, getCulturalValues } from '../../store/culturalValueStore'

function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export default function GrowthPathEditor() {
  const { gpId } = useParams()
  const { framework } = useFramework()
  const [jobs, setJobs] = useState([])
  const [gpSkills, setGpSkills] = useState([])
  const [allSkills, setAllSkills] = useState([])
  const [themes, setThemes] = useState([])
  const [phases, setPhases] = useState([])
  const [values, setValues] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddSkill, setShowAddSkill] = useState(false)

  useEffect(() => {
    loadData()
  }, [gpId])

  async function loadData() {
    try {
      setLoading(true)
      const [j, gps, s, t, p, v] = await Promise.all([
        getJobsByGrowthPath(gpId),
        getGrowthPathSkills(gpId),
        getSkills(framework.id),
        getSkillThemes(framework.id),
        getCulturalPhases(framework.id),
        getCulturalValues(framework.id),
      ])
      setJobs(j.sort((a, b) => (a.rankInGp || 0) - (b.rankInGp || 0)))
      setGpSkills(gps)
      setAllSkills(s)
      setThemes(t)
      setPhases(p)
      setValues(v)
    } catch (err) {
      console.error('Failed to load growth path data:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddJob() {
    const name = prompt('Naam van de nieuwe job/level:')
    if (!name?.trim()) return
    try {
      const job = await createJob({
        frameworkId: framework.id,
        growthPathId: gpId,
        name: name.trim(),
        rankInGp: jobs.length + 1,
      })
      setJobs((prev) => [...prev, job])
    } catch (err) {
      console.error('Failed to add job:', err)
    }
  }

  async function handleAddExistingSkill(skillId) {
    try {
      const gps = await addSkillToGrowthPath({
        growthPathId: gpId,
        skillId,
        sortOrder: gpSkills.length,
      })
      setGpSkills((prev) => [...prev, gps])
      setShowAddSkill(false)
    } catch (err) {
      console.error('Failed to add skill:', err)
    }
  }

  async function handleCreateAndAddSkill(title, themeId) {
    try {
      const skill = await createSkill({
        frameworkId: framework.id,
        skillThemeId: themeId || null,
        title,
      })
      setAllSkills((prev) => [...prev, skill])
      await handleAddExistingSkill(skill.id)
    } catch (err) {
      console.error('Failed to create skill:', err)
    }
  }

  async function handleRemoveSkill(gpsId) {
    try {
      await removeSkillFromGrowthPath(gpsId)
      setGpSkills((prev) => prev.filter((s) => s.id !== gpsId))
    } catch (err) {
      console.error('Failed to remove skill:', err)
    }
  }

  async function handleSaveDescription(growthPathSkillId, jobId, description) {
    try {
      const level = await upsertSkillLevelDescription({ growthPathSkillId, jobId, description })
      setGpSkills((prev) =>
        prev.map((gps) => {
          if (gps.id !== growthPathSkillId) return gps
          const existing = gps.levelDescriptions.find((l) => l.jobId === jobId)
          if (existing) {
            return { ...gps, levelDescriptions: gps.levelDescriptions.map((l) => (l.jobId === jobId ? level : l)) }
          }
          return { ...gps, levelDescriptions: [...gps.levelDescriptions, level] }
        })
      )
    } catch (err) {
      console.error('Failed to save description:', err)
    }
  }

  // Group skills by theme
  const groupedSkills = []
  const themeMap = new Map()
  for (const gps of gpSkills) {
    const themeId = gps.skill?.skillThemeId || '_none'
    if (!themeMap.has(themeId)) {
      const theme = themes.find((t) => t.id === themeId)
      themeMap.set(themeId, { theme: theme || null, skills: [] })
    }
    themeMap.get(themeId).skills.push(gps)
  }
  for (const [, group] of themeMap) {
    groupedSkills.push(group)
  }

  if (loading) {
    return (
      <div>
        <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse mb-4" />
        <div className="h-64 bg-neutral-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link
            to={`/tools/career-framework/${framework.id}/jobs`}
            className="text-xs text-neutral-400 hover:text-brand transition-colors"
          >
            ← Terug naar Jobs & Paden
          </Link>
          <h1 className="text-xl font-bold text-neutral-900 mt-1">Growth Path Editor</h1>
        </div>
      </div>

      {/* Matrix */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
            {/* Column headers = Jobs/Levels */}
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-neutral-50 border-b border-r border-neutral-200 px-3 py-3 text-left w-44 min-w-[176px]">
                  <span className="text-xs text-neutral-400 uppercase tracking-wider">Skill</span>
                </th>
                {jobs.map((job) => {
                  const phase = phases.find((p) => p.id === job.culturalPhaseId)
                  return (
                    <th key={job.id} className="border-b border-r border-neutral-200 px-3 py-2 text-center min-w-[160px] bg-neutral-50">
                      <div className="text-sm font-semibold text-neutral-800">{job.name}</div>
                      {phase && (
                        <span className="text-[10px] uppercase tracking-wide text-neutral-400">{phase.name}</span>
                      )}
                      {job.mission && (
                        <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-2 font-normal">"{job.mission}"</p>
                      )}
                    </th>
                  )
                })}
                <th className="border-b border-neutral-200 px-2 py-2 bg-neutral-50 w-12">
                  <button
                    onClick={handleAddJob}
                    className="p-1 text-neutral-400 hover:text-brand transition-colors"
                    title="Level/job toevoegen"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Cultural Values section */}
              {values.length > 0 && (
                <>
                  <tr>
                    <td
                      colSpan={jobs.length + 2}
                      className="sticky left-0 bg-brand-lightest/50 px-3 py-1.5 text-[10px] font-semibold text-brand uppercase tracking-wider border-b border-neutral-200"
                    >
                      Cultural Values
                    </td>
                  </tr>
                  {values.map((val) => (
                    <tr key={val.id} className="border-b border-neutral-100">
                      <td className="sticky left-0 z-10 bg-white border-r border-neutral-200 px-3 py-2">
                        <div className="text-xs font-medium text-neutral-600">{val.name}</div>
                        {val.mantra && <div className="text-[10px] text-neutral-400 italic">"{val.mantra}"</div>}
                      </td>
                      {jobs.map((job) => {
                        const phase = phases.find((p) => p.id === job.culturalPhaseId)
                        const level = phase ? val.levels.find((l) => l.culturalPhaseId === phase.id) : null
                        return (
                          <td key={job.id} className="border-r border-neutral-100 px-2 py-2 bg-brand-lightest/20">
                            <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-4">
                              {level?.description || <span className="text-neutral-300 italic">—</span>}
                            </p>
                          </td>
                        )
                      })}
                      <td />
                    </tr>
                  ))}
                </>
              )}

              {/* Skills section */}
              {groupedSkills.map((group, gIdx) => (
                <SkillGroup
                  key={gIdx}
                  theme={group.theme}
                  skills={group.skills}
                  jobs={jobs}
                  onSaveDescription={handleSaveDescription}
                  onRemoveSkill={handleRemoveSkill}
                  colSpan={jobs.length + 2}
                />
              ))}

              {/* Empty state */}
              {gpSkills.length === 0 && (
                <tr>
                  <td colSpan={jobs.length + 2} className="text-center py-8 text-sm text-neutral-400">
                    Nog geen skills toegevoegd aan dit growth path.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add skill button */}
        <div className="border-t border-neutral-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setShowAddSkill(true)}
            className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-brand-dark transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Skill toevoegen
          </button>
        </div>
      </div>

      {/* Add Skill Modal */}
      {showAddSkill && (
        <AddSkillModal
          allSkills={allSkills}
          themes={themes}
          existingSkillIds={gpSkills.map((s) => s.skillId)}
          onAddExisting={handleAddExistingSkill}
          onCreateNew={handleCreateAndAddSkill}
          onClose={() => setShowAddSkill(false)}
          frameworkId={framework.id}
        />
      )}
    </div>
  )
}

function SkillGroup({ theme, skills, jobs, onSaveDescription, onRemoveSkill, colSpan }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {theme && (
        <tr>
          <td
            colSpan={colSpan}
            className="sticky left-0 bg-neutral-50 px-3 py-1.5 border-b border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
            onClick={() => setCollapsed(!collapsed)}
          >
            <div className="flex items-center gap-1.5">
              <svg
                className={`w-3 h-3 text-neutral-400 transition-transform ${collapsed ? '' : 'rotate-90'}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
              <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">{theme.name}</span>
              <span className="text-[10px] text-neutral-400">({skills.length})</span>
            </div>
          </td>
        </tr>
      )}
      {!collapsed &&
        skills.map((gps) => (
          <tr key={gps.id} className="group border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
            <td className="sticky left-0 z-10 bg-white group-hover:bg-neutral-50/50 border-r border-neutral-200 px-3 py-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-neutral-700">{gps.skill?.title}</span>
                <button
                  onClick={() => { if (confirm('Skill verwijderen uit dit growth path?')) onRemoveSkill(gps.id) }}
                  className="p-0.5 text-neutral-300 hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {gps.skill?.summary && (
                <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">{gps.skill.summary}</p>
              )}
            </td>
            {jobs.map((job) => {
              const desc = gps.levelDescriptions.find((l) => l.jobId === job.id)
              return (
                <MatrixCell
                  key={`${gps.id}-${job.id}`}
                  description={desc?.description || ''}
                  onSave={(text) => onSaveDescription(gps.id, job.id, text)}
                />
              )
            })}
            <td />
          </tr>
        ))}
    </>
  )
}

function MatrixCell({ description, onSave }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(description)
  const textareaRef = useRef(null)

  const debouncedSave = useCallback(
    debounce((val) => {
      if (val.trim()) onSave(val.trim())
    }, 800),
    [onSave]
  )

  useEffect(() => {
    setText(description)
  }, [description])

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [editing])

  function handleBlur() {
    setEditing(false)
    if (text.trim() && text.trim() !== description) {
      onSave(text.trim())
    }
  }

  if (editing) {
    return (
      <td className="border-r border-neutral-100 p-0">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = e.target.scrollHeight + 'px'
            debouncedSave(e.target.value)
          }}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Escape') { setText(description); setEditing(false) }
            if (e.key === 'Tab') {
              e.preventDefault()
              handleBlur()
              // Focus next cell
              const nextCell = e.target.closest('td')?.nextElementSibling?.querySelector('[data-cell]')
              if (nextCell) nextCell.click()
            }
          }}
          className="w-full min-h-[60px] px-2 py-1.5 text-[11px] outline-none resize-none border-2 border-brand rounded bg-white"
        />
      </td>
    )
  }

  return (
    <td
      className="border-r border-neutral-100 px-2 py-1.5 cursor-pointer hover:bg-brand-lightest/30 transition-colors"
      onClick={() => setEditing(true)}
      data-cell
    >
      {text ? (
        <p className="text-[11px] text-neutral-600 leading-relaxed line-clamp-4">{text}</p>
      ) : (
        <p className="text-[10px] text-neutral-300 italic">Klik om in te vullen...</p>
      )}
    </td>
  )
}

function AddSkillModal({ allSkills, themes, existingSkillIds, onAddExisting, onCreateNew, onClose, frameworkId }) {
  const [search, setSearch] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newThemeId, setNewThemeId] = useState('')
  const [tab, setTab] = useState('existing') // 'existing' | 'new'

  const availableSkills = allSkills.filter(
    (s) => !existingSkillIds.includes(s.id) && s.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 pt-5 pb-3 border-b border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-900">Skill toevoegen</h3>

          <div className="flex gap-1 mt-3 bg-neutral-100 rounded-lg p-0.5">
            <button
              onClick={() => setTab('existing')}
              className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${tab === 'existing' ? 'bg-white shadow-sm text-neutral-800 font-medium' : 'text-neutral-500'}`}
            >
              Bestaande skill
            </button>
            <button
              onClick={() => setTab('new')}
              className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${tab === 'new' ? 'bg-white shadow-sm text-neutral-800 font-medium' : 'text-neutral-500'}`}
            >
              Nieuwe skill
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'existing' ? (
            <div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Zoek skill..."
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:border-brand outline-none mb-3"
                autoFocus
              />
              {availableSkills.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-4">
                  {allSkills.length === 0 ? 'Nog geen skills aangemaakt.' : 'Geen skills gevonden.'}
                </p>
              ) : (
                <div className="space-y-1">
                  {availableSkills.map((skill) => {
                    const theme = themes.find((t) => t.id === skill.skillThemeId)
                    return (
                      <button
                        key={skill.id}
                        onClick={() => onAddExisting(skill.id)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-brand-lightest transition-colors"
                      >
                        <span className="text-sm text-neutral-800">{skill.title}</span>
                        {theme && (
                          <span className="text-[10px] text-neutral-400 ml-2">{theme.name}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Skill naam *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="bijv. Contract Drafting"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:border-brand outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Thema</label>
                <select
                  value={newThemeId}
                  onChange={(e) => setNewThemeId(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:border-brand outline-none"
                >
                  <option value="">Geen thema</option>
                  {themes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  if (newTitle.trim()) onCreateNew(newTitle.trim(), newThemeId || null)
                }}
                disabled={!newTitle.trim()}
                className="w-full px-4 py-2.5 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors"
              >
                Aanmaken & toevoegen
              </button>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-neutral-100">
          <button onClick={onClose} className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
            Sluiten
          </button>
        </div>
      </div>
    </div>
  )
}
