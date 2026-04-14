import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getSessionById, updateSession, getSubmissionCount } from './store/sessionStore'
import SessionForm from './components/SessionForm'

export default function EditSession() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [submissionCount, setSubmissionCount] = useState(0)

  useEffect(() => {
    async function load() {
      const s = await getSessionById(sessionId)
      if (!s) return navigate('/tools/ranking-the-values')
      if (s.status !== 'draft') return navigate(`/tools/ranking-the-values/${sessionId}`)
      setSession(s)
      const count = await getSubmissionCount(sessionId)
      setSubmissionCount(count)
    }
    load()
  }, [sessionId, navigate])

  if (!session) return null

  async function handleSubmit(data) {
    await updateSession(sessionId, data)
    navigate(`/tools/ranking-the-values/${sessionId}`)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">Sessie bewerken</h1>
      {submissionCount > 0 && (
        <div className="mb-6 p-4 bg-warning/10 border border-warning/30 rounded-lg text-sm text-warning-dark">
          <strong>Let op:</strong> Er {submissionCount === 1 ? 'is' : 'zijn'} al {submissionCount} {submissionCount === 1 ? 'inzending' : 'inzendingen'}.
          Waarden kunnen niet meer worden gewijzigd.
        </div>
      )}
      <SessionForm
        initialData={session}
        isEditing
        hasSubmissions={submissionCount > 0}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/tools/ranking-the-values/${sessionId}`)}
      />
    </div>
  )
}
