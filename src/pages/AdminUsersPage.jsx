import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '../lib/supabase'

export default function AdminUsersPage() {
  const { isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  // Invite form
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [invitePassword, setInvitePassword] = useState('')
  const [inviteSaving, setInviteSaving] = useState(false)
  const [inviteMessage, setInviteMessage] = useState(null)

  // Edit modal
  const [editUser, setEditUser] = useState(null)
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editMessage, setEditMessage] = useState(null)

  // General message
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (!isAdmin) return
    fetchUsers()
  }, [isAdmin])

  async function fetchUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })

    if (!error) setUsers(data)
    setLoading(false)
  }

  if (!isAdmin) return <Navigate to="/dashboard" replace />

  async function handleInvite(e) {
    e.preventDefault()
    setInviteMessage(null)

    if (!inviteEmail.trim() || !invitePassword) {
      setInviteMessage({ type: 'error', text: 'E-mail en wachtwoord zijn verplicht.' })
      return
    }

    if (invitePassword.length < 6) {
      setInviteMessage({ type: 'error', text: 'Wachtwoord moet minimaal 6 tekens zijn.' })
      return
    }

    setInviteSaving(true)

    // Save current admin session before signUp (signUp auto-logs in the new user)
    const { data: { session: adminSession } } = await supabase.auth.getSession()

    const { data, error } = await supabase.auth.signUp({
      email: inviteEmail.trim(),
      password: invitePassword,
      options: {
        data: { full_name: inviteName.trim() },
      },
    })

    // Restore admin session immediately
    if (adminSession) {
      await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      })
    }

    if (error) {
      setInviteMessage({ type: 'error', text: error.message })
      setInviteSaving(false)
      return
    }

    // Update role if admin
    if (inviteRole === 'admin' && data.user) {
      await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', data.user.id)
    }

    setInviteSaving(false)
    setInviteEmail('')
    setInviteName('')
    setInvitePassword('')
    setInviteRole('member')
    setShowInvite(false)
    setInviteMessage(null)
    await fetchUsers()
    setMessage({ type: 'success', text: `Gebruiker ${inviteEmail.trim()} is aangemaakt.` })
  }

  function openEdit(profile) {
    setEditUser(profile)
    setEditName(profile.full_name || '')
    setEditRole(profile.role)
    setEditMessage(null)
  }

  async function handleEditSave(e) {
    e.preventDefault()
    setEditMessage(null)
    setEditSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editName.trim(),
        role: editRole,
      })
      .eq('id', editUser.id)

    setEditSaving(false)

    if (error) {
      setEditMessage({ type: 'error', text: error.message })
      return
    }

    setEditUser(null)
    await fetchUsers()
    setMessage({ type: 'success', text: 'Gebruiker bijgewerkt.' })
  }

  async function handleDelete(profile) {
    if (!confirm(`Weet je zeker dat je ${profile.email} wilt verwijderen? Dit kan niet ongedaan worden.`)) return

    setMessage(null)

    // Delete from auth.users via database function (cascades to profiles)
    const { error } = await supabase.rpc('delete_user', { user_id: profile.id })

    if (error) {
      setMessage({ type: 'error', text: error.message })
      return
    }

    await fetchUsers()
    setMessage({ type: 'success', text: `${profile.email} is verwijderd.` })
  }

  function MessageBox({ message: msg }) {
    if (!msg) return null
    const colors = {
      success: 'bg-success/10 border-success/20 text-success',
      error: 'bg-error/10 border-error/20 text-error',
    }
    return (
      <div className={`p-3 rounded-lg border text-sm ${colors[msg.type]} mb-4`}>
        {msg.text}
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-brand transition-colors mb-4"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Dashboard
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Gebruikersbeheer</h1>
        <button
          onClick={() => { setShowInvite(!showInvite); setInviteMessage(null) }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-lg font-medium text-sm hover:bg-brand-dark transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Uitnodigen
        </button>
      </div>

      <MessageBox message={message} />

      {/* Invite form */}
      {showInvite && (
        <form onSubmit={handleInvite} className="bg-white border border-neutral-200 rounded-xl p-5 mb-6 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-700">Nieuwe gebruiker uitnodigen</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Naam</label>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Volledige naam"
                className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">E-mail *</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="naam@getsumm.co"
                required
                className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Wachtwoord *</label>
              <input
                type="password"
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
                placeholder="Min. 6 tekens"
                required
                className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Rol</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                <option value="member">Medewerker</option>
                <option value="admin">Beheerder</option>
              </select>
            </div>
          </div>

          {inviteMessage && <MessageBox message={inviteMessage} />}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowInvite(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={inviteSaving}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {inviteSaving ? 'Aanmaken...' : 'Gebruiker aanmaken'}
            </button>
          </div>
        </form>
      )}

      {/* Users list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-neutral-200">
          <p className="text-neutral-500">Geen gebruikers gevonden.</p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left">
                <th className="px-5 py-3 font-medium text-neutral-500">Naam</th>
                <th className="px-5 py-3 font-medium text-neutral-500">E-mail</th>
                <th className="px-5 py-3 font-medium text-neutral-500">Rol</th>
                <th className="px-5 py-3 font-medium text-neutral-500 text-right">Acties</th>
              </tr>
            </thead>
            <tbody>
              {users.map((profile) => (
                <tr key={profile.id} className="border-b border-neutral-50 last:border-0">
                  <td className="px-5 py-3 text-neutral-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold shrink-0">
                        {(profile.full_name || profile.email).charAt(0).toUpperCase()}
                      </div>
                      {profile.full_name || <span className="text-neutral-400 italic">Geen naam</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-neutral-600">{profile.email}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      profile.role === 'admin'
                        ? 'bg-brand/10 text-brand'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {profile.role === 'admin' ? 'Beheerder' : 'Medewerker'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(profile)}
                        className="p-1.5 text-neutral-400 hover:text-brand rounded-lg hover:bg-brand/5 transition-colors"
                        title="Bewerken"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(profile)}
                        className="p-1.5 text-neutral-400 hover:text-error rounded-lg hover:bg-error/5 transition-colors"
                        title="Verwijderen"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditUser(null)}>
          <form
            onSubmit={handleEditSave}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4"
          >
            <h2 className="text-base font-semibold text-neutral-900">Gebruiker bewerken</h2>
            <p className="text-sm text-neutral-500">{editUser.email}</p>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Naam</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Rol</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                <option value="member">Medewerker</option>
                <option value="admin">Beheerder</option>
              </select>
            </div>

            {editMessage && (
              <div className={`p-3 rounded-lg border text-sm ${
                editMessage.type === 'error' ? 'bg-error/10 border-error/20 text-error' : 'bg-success/10 border-success/20 text-success'
              }`}>
                {editMessage.text}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={editSaving}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {editSaving ? 'Opslaan...' : 'Opslaan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
