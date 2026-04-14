import { supabase } from '../../../lib/supabase'
import { generateShareCode } from '../utils/shareCode'

// --- snake_case ↔ camelCase mapping ---

function toCamelSession(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    values: row.values,
    status: row.status,
    shareCode: row.share_code,
    createdBy: row.created_by,
    createdAt: row.created_at,
  }
}

function toCamelSubmission(row) {
  return {
    id: row.id,
    sessionId: row.session_id,
    participantName: row.participant_name,
    participantEmail: row.participant_email,
    rankings: row.rankings,
    submittedAt: row.submitted_at,
  }
}

// ============================================================
// Sessions
// ============================================================

export async function getSessions(userId) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*, submissions(count)')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data.map((row) => ({
    ...toCamelSession(row),
    submissionCount: row.submissions?.[0]?.count ?? 0,
  }))
}

export async function getSessionById(id) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return toCamelSession(data)
}

export async function getSessionByShareCode(shareCode) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('share_code', shareCode)
    .single()

  if (error) return null
  return toCamelSession(data)
}

export async function createSession({ title, description, values, createdBy }) {
  const shareCode = generateShareCode()

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      title,
      description: description || null,
      values,
      status: 'draft',
      share_code: shareCode,
      created_by: createdBy,
    })
    .select()
    .single()

  if (error) throw error
  return toCamelSession(data)
}

export async function updateSession(id, updates) {
  // Map camelCase keys to snake_case for the update
  const snakeUpdates = {}
  if (updates.title !== undefined) snakeUpdates.title = updates.title
  if (updates.description !== undefined) snakeUpdates.description = updates.description
  if (updates.values !== undefined) snakeUpdates.values = updates.values
  if (updates.status !== undefined) snakeUpdates.status = updates.status

  const { data, error } = await supabase
    .from('sessions')
    .update(snakeUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) return null
  return toCamelSession(data)
}

export async function deleteSession(id) {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============================================================
// Submissions
// ============================================================

export async function getSubmissionsBySessionId(sessionId) {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('session_id', sessionId)
    .order('submitted_at', { ascending: true })

  if (error) throw error
  return data.map(toCamelSubmission)
}

export async function getSubmissionCount(sessionId) {
  const { count, error } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId)

  if (error) throw error
  return count
}

export async function getSubmissionByEmail(sessionId, email) {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('session_id', sessionId)
    .ilike('participant_email', email)
    .maybeSingle()

  if (error) return null
  return data ? toCamelSubmission(data) : null
}

export async function createSubmission({ sessionId, participantName, participantEmail, rankings }) {
  const { data, error } = await supabase
    .from('submissions')
    .insert({
      session_id: sessionId,
      participant_name: participantName,
      participant_email: participantEmail,
      rankings,
    })
    .select()
    .single()

  if (error) {
    // Unique constraint violation = duplicate email
    if (error.code === '23505') {
      return { error: 'Er is al een inzending met dit e-mailadres.' }
    }
    return { error: error.message }
  }

  return toCamelSubmission(data)
}

// Re-export for realtime subscription usage in components
export { toCamelSession, toCamelSubmission }
