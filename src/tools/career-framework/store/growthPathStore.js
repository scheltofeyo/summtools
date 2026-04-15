import { supabase } from '../../../lib/supabase'

function toCamel(row) {
  return {
    id: row.id,
    frameworkId: row.framework_id,
    name: row.name,
    sortOrder: row.sort_order,
  }
}

export async function getGrowthPaths(frameworkId) {
  const { data, error } = await supabase
    .from('fw_growth_paths')
    .select('*')
    .eq('framework_id', frameworkId)
    .order('sort_order')

  if (error) throw error
  return data.map(toCamel)
}

export async function createGrowthPath({ frameworkId, name, sortOrder = 0 }) {
  const { data, error } = await supabase
    .from('fw_growth_paths')
    .insert({ framework_id: frameworkId, name, sort_order: sortOrder })
    .select()
    .single()

  if (error) throw error
  return toCamel(data)
}

export async function updateGrowthPath(id, updates) {
  const snakeUpdates = {}
  if (updates.name !== undefined) snakeUpdates.name = updates.name
  if (updates.sortOrder !== undefined) snakeUpdates.sort_order = updates.sortOrder

  const { data, error } = await supabase
    .from('fw_growth_paths')
    .update(snakeUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return toCamel(data)
}

export async function deleteGrowthPath(id) {
  const { error } = await supabase.from('fw_growth_paths').delete().eq('id', id)
  if (error) throw error
}
