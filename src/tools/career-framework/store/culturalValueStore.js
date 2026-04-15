import { supabase } from '../../../lib/supabase'

// --- Cultural Phases ---

function toCamelPhase(row) {
  return {
    id: row.id,
    frameworkId: row.framework_id,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
  }
}

export async function getCulturalPhases(frameworkId) {
  const { data, error } = await supabase
    .from('fw_cultural_phases')
    .select('*')
    .eq('framework_id', frameworkId)
    .order('sort_order')

  if (error) throw error
  return data.map(toCamelPhase)
}

export async function createCulturalPhase({ frameworkId, name, description, sortOrder = 0 }) {
  const { data, error } = await supabase
    .from('fw_cultural_phases')
    .insert({ framework_id: frameworkId, name, description: description || null, sort_order: sortOrder })
    .select()
    .single()

  if (error) throw error
  return toCamelPhase(data)
}

export async function updateCulturalPhase(id, updates) {
  const snakeUpdates = {}
  if (updates.name !== undefined) snakeUpdates.name = updates.name
  if (updates.description !== undefined) snakeUpdates.description = updates.description
  if (updates.sortOrder !== undefined) snakeUpdates.sort_order = updates.sortOrder

  const { data, error } = await supabase
    .from('fw_cultural_phases')
    .update(snakeUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return toCamelPhase(data)
}

export async function deleteCulturalPhase(id) {
  const { error } = await supabase.from('fw_cultural_phases').delete().eq('id', id)
  if (error) throw error
}

// --- Cultural Values ---

function toCamelValue(row) {
  return {
    id: row.id,
    frameworkId: row.framework_id,
    type: row.type,
    name: row.name,
    mantra: row.mantra,
    description: row.description,
    sortOrder: row.sort_order,
    levels: row.fw_cultural_value_levels?.map(toCamelValueLevel) ?? [],
  }
}

function toCamelValueLevel(row) {
  return {
    id: row.id,
    culturalValueId: row.cultural_value_id,
    culturalPhaseId: row.cultural_phase_id,
    description: row.description,
  }
}

export async function getCulturalValues(frameworkId) {
  const { data, error } = await supabase
    .from('fw_cultural_values')
    .select('*, fw_cultural_value_levels(*)')
    .eq('framework_id', frameworkId)
    .order('sort_order')

  if (error) throw error
  return data.map(toCamelValue)
}

export async function createCulturalValue({ frameworkId, type, name, mantra, description, sortOrder = 0 }) {
  const { data, error } = await supabase
    .from('fw_cultural_values')
    .insert({
      framework_id: frameworkId,
      type: type || null,
      name,
      mantra: mantra || null,
      description: description || null,
      sort_order: sortOrder,
    })
    .select('*, fw_cultural_value_levels(*)')
    .single()

  if (error) throw error
  return toCamelValue(data)
}

export async function updateCulturalValue(id, updates) {
  const snakeUpdates = {}
  if (updates.type !== undefined) snakeUpdates.type = updates.type
  if (updates.name !== undefined) snakeUpdates.name = updates.name
  if (updates.mantra !== undefined) snakeUpdates.mantra = updates.mantra
  if (updates.description !== undefined) snakeUpdates.description = updates.description
  if (updates.sortOrder !== undefined) snakeUpdates.sort_order = updates.sortOrder

  const { data, error } = await supabase
    .from('fw_cultural_values')
    .update(snakeUpdates)
    .eq('id', id)
    .select('*, fw_cultural_value_levels(*)')
    .single()

  if (error) throw error
  return toCamelValue(data)
}

export async function deleteCulturalValue(id) {
  const { error } = await supabase.from('fw_cultural_values').delete().eq('id', id)
  if (error) throw error
}

// --- Cultural Value Levels ---

export async function upsertCulturalValueLevel({ culturalValueId, culturalPhaseId, description }) {
  const { data, error } = await supabase
    .from('fw_cultural_value_levels')
    .upsert(
      {
        cultural_value_id: culturalValueId,
        cultural_phase_id: culturalPhaseId,
        description,
      },
      { onConflict: 'cultural_value_id,cultural_phase_id' }
    )
    .select()
    .single()

  if (error) throw error
  return toCamelValueLevel(data)
}
