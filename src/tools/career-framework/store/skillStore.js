import { supabase } from '../../../lib/supabase'

// --- Skill Themes ---

function toCamelTheme(row) {
  return {
    id: row.id,
    frameworkId: row.framework_id,
    name: row.name,
    description: row.description,
  }
}

export async function getSkillThemes(frameworkId) {
  const { data, error } = await supabase
    .from('fw_skill_themes')
    .select('*')
    .eq('framework_id', frameworkId)
    .order('name')

  if (error) throw error
  return data.map(toCamelTheme)
}

export async function createSkillTheme({ frameworkId, name, description }) {
  const { data, error } = await supabase
    .from('fw_skill_themes')
    .insert({ framework_id: frameworkId, name, description: description || null })
    .select()
    .single()

  if (error) throw error
  return toCamelTheme(data)
}

export async function updateSkillTheme(id, updates) {
  const snakeUpdates = {}
  if (updates.name !== undefined) snakeUpdates.name = updates.name
  if (updates.description !== undefined) snakeUpdates.description = updates.description

  const { data, error } = await supabase
    .from('fw_skill_themes')
    .update(snakeUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return toCamelTheme(data)
}

export async function deleteSkillTheme(id) {
  const { error } = await supabase.from('fw_skill_themes').delete().eq('id', id)
  if (error) throw error
}

// --- Skills ---

function toCamelSkill(row) {
  return {
    id: row.id,
    frameworkId: row.framework_id,
    skillThemeId: row.skill_theme_id,
    title: row.title,
    summary: row.summary,
  }
}

export async function getSkills(frameworkId) {
  const { data, error } = await supabase
    .from('fw_skills')
    .select('*')
    .eq('framework_id', frameworkId)
    .order('title')

  if (error) throw error
  return data.map(toCamelSkill)
}

export async function createSkill({ frameworkId, skillThemeId, title, summary }) {
  const { data, error } = await supabase
    .from('fw_skills')
    .insert({
      framework_id: frameworkId,
      skill_theme_id: skillThemeId || null,
      title,
      summary: summary || null,
    })
    .select()
    .single()

  if (error) throw error
  return toCamelSkill(data)
}

export async function updateSkill(id, updates) {
  const snakeUpdates = {}
  if (updates.title !== undefined) snakeUpdates.title = updates.title
  if (updates.summary !== undefined) snakeUpdates.summary = updates.summary
  if (updates.skillThemeId !== undefined) snakeUpdates.skill_theme_id = updates.skillThemeId || null

  const { data, error } = await supabase
    .from('fw_skills')
    .update(snakeUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return toCamelSkill(data)
}

export async function deleteSkill(id) {
  const { error } = await supabase.from('fw_skills').delete().eq('id', id)
  if (error) throw error
}

// --- Growth Path Skills (koppeltabel) ---

function toCamelGPS(row) {
  return {
    id: row.id,
    growthPathId: row.growth_path_id,
    skillId: row.skill_id,
    sortOrder: row.sort_order,
    skill: row.fw_skills ? toCamelSkill(row.fw_skills) : null,
    levelDescriptions: row.fw_skill_level_descriptions?.map(toCamelLevelDesc) ?? [],
  }
}

function toCamelLevelDesc(row) {
  return {
    id: row.id,
    growthPathSkillId: row.growth_path_skill_id,
    jobId: row.job_id,
    description: row.description,
  }
}

export async function getGrowthPathSkills(growthPathId) {
  const { data, error } = await supabase
    .from('fw_growth_path_skills')
    .select('*, fw_skills(*), fw_skill_level_descriptions(*)')
    .eq('growth_path_id', growthPathId)
    .order('sort_order')

  if (error) throw error
  return data.map(toCamelGPS)
}

export async function addSkillToGrowthPath({ growthPathId, skillId, sortOrder = 0 }) {
  const { data, error } = await supabase
    .from('fw_growth_path_skills')
    .insert({ growth_path_id: growthPathId, skill_id: skillId, sort_order: sortOrder })
    .select('*, fw_skills(*), fw_skill_level_descriptions(*)')
    .single()

  if (error) throw error
  return toCamelGPS(data)
}

export async function removeSkillFromGrowthPath(growthPathSkillId) {
  const { error } = await supabase
    .from('fw_growth_path_skills')
    .delete()
    .eq('id', growthPathSkillId)

  if (error) throw error
}

export async function reorderGrowthPathSkills(items) {
  const updates = items.map((item, index) => ({
    id: item.id,
    growth_path_id: item.growthPathId,
    skill_id: item.skillId,
    sort_order: index,
  }))

  const { error } = await supabase.from('fw_growth_path_skills').upsert(updates)
  if (error) throw error
}

// --- Skill Level Descriptions ---

export async function upsertSkillLevelDescription({ growthPathSkillId, jobId, description }) {
  const { data, error } = await supabase
    .from('fw_skill_level_descriptions')
    .upsert(
      {
        growth_path_skill_id: growthPathSkillId,
        job_id: jobId,
        description,
      },
      { onConflict: 'growth_path_skill_id,job_id' }
    )
    .select()
    .single()

  if (error) throw error
  return toCamelLevelDesc(data)
}

export async function deleteSkillLevelDescription(id) {
  const { error } = await supabase
    .from('fw_skill_level_descriptions')
    .delete()
    .eq('id', id)

  if (error) throw error
}
