import { supabase } from '../../../lib/supabase'

// --- snake_case ↔ camelCase mapping ---

function toCamel(row) {
  return {
    id: row.id,
    name: row.name,
    companyName: row.company_name,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ============================================================
// Frameworks
// ============================================================

export async function getFrameworks() {
  const { data, error } = await supabase
    .from('frameworks')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data.map(toCamel)
}

export async function getFrameworkById(id) {
  const { data, error } = await supabase
    .from('frameworks')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return toCamel(data)
}

export async function createFramework({ name, companyName, createdBy }) {
  const { data, error } = await supabase
    .from('frameworks')
    .insert({
      name,
      company_name: companyName,
      created_by: createdBy,
    })
    .select()
    .single()

  if (error) throw error
  return toCamel(data)
}

export async function updateFramework(id, updates) {
  const snakeUpdates = {}
  if (updates.name !== undefined) snakeUpdates.name = updates.name
  if (updates.companyName !== undefined) snakeUpdates.company_name = updates.companyName
  if (updates.status !== undefined) snakeUpdates.status = updates.status

  const { data, error } = await supabase
    .from('frameworks')
    .update(snakeUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return toCamel(data)
}

export async function deleteFramework(id) {
  const { error } = await supabase
    .from('frameworks')
    .delete()
    .eq('id', id)

  if (error) throw error
}
