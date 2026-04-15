import { supabase } from '../../../lib/supabase'

function toCamel(row) {
  return {
    id: row.id,
    frameworkId: row.framework_id,
    name: row.name,
    emoji: row.emoji,
  }
}

export async function getTeams(frameworkId) {
  const { data, error } = await supabase
    .from('fw_teams')
    .select('*')
    .eq('framework_id', frameworkId)
    .order('name')

  if (error) throw error
  return data.map(toCamel)
}

export async function createTeam({ frameworkId, name, emoji }) {
  const { data, error } = await supabase
    .from('fw_teams')
    .insert({ framework_id: frameworkId, name, emoji: emoji || null })
    .select()
    .single()

  if (error) throw error
  return toCamel(data)
}

export async function updateTeam(id, updates) {
  const snakeUpdates = {}
  if (updates.name !== undefined) snakeUpdates.name = updates.name
  if (updates.emoji !== undefined) snakeUpdates.emoji = updates.emoji

  const { data, error } = await supabase
    .from('fw_teams')
    .update(snakeUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return toCamel(data)
}

export async function deleteTeam(id) {
  const { error } = await supabase.from('fw_teams').delete().eq('id', id)
  if (error) throw error
}
