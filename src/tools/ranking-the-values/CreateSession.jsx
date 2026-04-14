import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { createSession } from './store/sessionStore'
import SessionForm from './components/SessionForm'

export default function CreateSession() {
  const navigate = useNavigate()
  const { user } = useAuth()

  async function handleSubmit(data) {
    const session = await createSession({ ...data, createdBy: user.id })
    navigate(`/tools/ranking-the-values/${session.id}`)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Nieuwe sessie</h1>
      <SessionForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/tools/ranking-the-values')}
      />
    </div>
  )
}
