import { supabase } from '../../../lib/supabase'

function toCamel(row) {
  return {
    id: row.id,
    frameworkId: row.framework_id,
    jobId: row.job_id,
    firstName: row.first_name,
    preposition: row.preposition,
    lastName: row.last_name,
    email: row.email,
    startingDate: row.starting_date,
    primaryTeamId: row.primary_team_id,
    primaryTeamRole: row.primary_team_role,
    secondaryTeamId: row.secondary_team_id,
    secondaryTeamRole: row.secondary_team_role,
    companyRole: row.company_role,
    hasBuddy: row.has_buddy,
    hasCustomLead: row.has_custom_lead,
  }
}

export async function getPeople(frameworkId) {
  const { data, error } = await supabase
    .from('fw_people')
    .select('*')
    .eq('framework_id', frameworkId)
    .order('last_name')

  if (error) throw error
  return data.map(toCamel)
}

export async function createPerson({ frameworkId, firstName, preposition, lastName, email, startingDate, jobId, primaryTeamId, primaryTeamRole, secondaryTeamId, secondaryTeamRole, companyRole, hasBuddy, hasCustomLead }) {
  const { data, error } = await supabase
    .from('fw_people')
    .insert({
      framework_id: frameworkId,
      first_name: firstName,
      preposition: preposition || null,
      last_name: lastName,
      email: email || null,
      starting_date: startingDate || null,
      job_id: jobId || null,
      primary_team_id: primaryTeamId || null,
      primary_team_role: primaryTeamRole || 'Member',
      secondary_team_id: secondaryTeamId || null,
      secondary_team_role: secondaryTeamRole || 'Member',
      company_role: companyRole || 'Member',
      has_buddy: hasBuddy || false,
      has_custom_lead: hasCustomLead || false,
    })
    .select()
    .single()

  if (error) throw error
  return toCamel(data)
}

export async function updatePerson(id, updates) {
  const snakeUpdates = {}
  if (updates.firstName !== undefined) snakeUpdates.first_name = updates.firstName
  if (updates.preposition !== undefined) snakeUpdates.preposition = updates.preposition
  if (updates.lastName !== undefined) snakeUpdates.last_name = updates.lastName
  if (updates.email !== undefined) snakeUpdates.email = updates.email
  if (updates.startingDate !== undefined) snakeUpdates.starting_date = updates.startingDate
  if (updates.jobId !== undefined) snakeUpdates.job_id = updates.jobId || null
  if (updates.primaryTeamId !== undefined) snakeUpdates.primary_team_id = updates.primaryTeamId || null
  if (updates.primaryTeamRole !== undefined) snakeUpdates.primary_team_role = updates.primaryTeamRole
  if (updates.secondaryTeamId !== undefined) snakeUpdates.secondary_team_id = updates.secondaryTeamId || null
  if (updates.secondaryTeamRole !== undefined) snakeUpdates.secondary_team_role = updates.secondaryTeamRole
  if (updates.companyRole !== undefined) snakeUpdates.company_role = updates.companyRole
  if (updates.hasBuddy !== undefined) snakeUpdates.has_buddy = updates.hasBuddy
  if (updates.hasCustomLead !== undefined) snakeUpdates.has_custom_lead = updates.hasCustomLead

  const { data, error } = await supabase
    .from('fw_people')
    .update(snakeUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return toCamel(data)
}

export async function deletePerson(id) {
  const { error } = await supabase.from('fw_people').delete().eq('id', id)
  if (error) throw error
}
