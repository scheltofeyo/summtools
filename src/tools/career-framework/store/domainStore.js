import { supabase } from '../../../lib/supabase'

function toCamel(row) {
  return {
    id: row.id,
    frameworkId: row.framework_id,
    name: row.name,
    sortOrder: row.sort_order,
  }
}

export async function getDomains(frameworkId) {
  const { data, error } = await supabase
    .from('fw_domains')
    .select('*')
    .eq('framework_id', frameworkId)
    .order('sort_order')

  if (error) throw error
  return data.map(toCamel)
}

export async function createDomain({ frameworkId, name, sortOrder = 0 }) {
  const { data, error } = await supabase
    .from('fw_domains')
    .insert({ framework_id: frameworkId, name, sort_order: sortOrder })
    .select()
    .single()

  if (error) throw error
  return toCamel(data)
}

export async function updateDomain(id, updates) {
  const snakeUpdates = {}
  if (updates.name !== undefined) snakeUpdates.name = updates.name
  if (updates.sortOrder !== undefined) snakeUpdates.sort_order = updates.sortOrder

  const { data, error } = await supabase
    .from('fw_domains')
    .update(snakeUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return toCamel(data)
}

export async function deleteDomain(id) {
  const { error } = await supabase.from('fw_domains').delete().eq('id', id)
  if (error) throw error
}

export async function reorderDomains(items) {
  const updates = items.map((item, index) => ({
    id: item.id,
    framework_id: item.frameworkId,
    name: item.name,
    sort_order: index,
  }))

  const { error } = await supabase.from('fw_domains').upsert(updates)
  if (error) throw error
}
