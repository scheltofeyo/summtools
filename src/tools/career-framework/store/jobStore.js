import { supabase } from '../../../lib/supabase'

function toCamel(row) {
  return {
    id: row.id,
    frameworkId: row.framework_id,
    growthPathId: row.growth_path_id,
    domainId: row.domain_id,
    culturalPhaseId: row.cultural_phase_id,
    name: row.name,
    rankInGp: row.rank_in_gp,
    mission: row.mission,
    salary: row.salary,
    reportsTo: row.reports_to,
    experienceLevel: row.experience_level,
    optionalNotes: row.optional_notes,
  }
}

export async function getJobs(frameworkId) {
  const { data, error } = await supabase
    .from('fw_jobs')
    .select('*')
    .eq('framework_id', frameworkId)
    .order('rank_in_gp', { ascending: true, nullsFirst: false })

  if (error) throw error
  return data.map(toCamel)
}

export async function getJobsByGrowthPath(growthPathId) {
  const { data, error } = await supabase
    .from('fw_jobs')
    .select('*')
    .eq('growth_path_id', growthPathId)
    .order('rank_in_gp')

  if (error) throw error
  return data.map(toCamel)
}

export async function createJob({ frameworkId, growthPathId, domainId, culturalPhaseId, name, rankInGp, mission, salary, reportsTo, experienceLevel, optionalNotes }) {
  const { data, error } = await supabase
    .from('fw_jobs')
    .insert({
      framework_id: frameworkId,
      growth_path_id: growthPathId || null,
      domain_id: domainId || null,
      cultural_phase_id: culturalPhaseId || null,
      name,
      rank_in_gp: rankInGp ?? null,
      mission: mission || null,
      salary: salary || null,
      reports_to: reportsTo || null,
      experience_level: experienceLevel || null,
      optional_notes: optionalNotes || null,
    })
    .select()
    .single()

  if (error) throw error
  return toCamel(data)
}

export async function updateJob(id, updates) {
  const snakeUpdates = {}
  if (updates.name !== undefined) snakeUpdates.name = updates.name
  if (updates.growthPathId !== undefined) snakeUpdates.growth_path_id = updates.growthPathId || null
  if (updates.domainId !== undefined) snakeUpdates.domain_id = updates.domainId || null
  if (updates.culturalPhaseId !== undefined) snakeUpdates.cultural_phase_id = updates.culturalPhaseId || null
  if (updates.rankInGp !== undefined) snakeUpdates.rank_in_gp = updates.rankInGp
  if (updates.mission !== undefined) snakeUpdates.mission = updates.mission
  if (updates.salary !== undefined) snakeUpdates.salary = updates.salary
  if (updates.reportsTo !== undefined) snakeUpdates.reports_to = updates.reportsTo
  if (updates.experienceLevel !== undefined) snakeUpdates.experience_level = updates.experienceLevel
  if (updates.optionalNotes !== undefined) snakeUpdates.optional_notes = updates.optionalNotes

  const { data, error } = await supabase
    .from('fw_jobs')
    .update(snakeUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return toCamel(data)
}

export async function deleteJob(id) {
  const { error } = await supabase.from('fw_jobs').delete().eq('id', id)
  if (error) throw error
}
