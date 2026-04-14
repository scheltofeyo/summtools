import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function ProfilePage() {
  const { user, updateProfile, updatePassword } = useAuth()

  const [fullName, setFullName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState(null)

  async function handleProfileSubmit(e) {
    e.preventDefault()
    setProfileMessage(null)
    setProfileSaving(true)

    if (!fullName.trim()) {
      setProfileMessage({ type: 'error', text: 'Naam is verplicht.' })
      setProfileSaving(false)
      return
    }

    const updates = {}
    if (fullName.trim() !== user.name) updates.fullName = fullName.trim()
    if (email.trim() !== user.email) updates.email = email.trim()

    if (Object.keys(updates).length === 0) {
      setProfileMessage({ type: 'info', text: 'Geen wijzigingen gevonden.' })
      setProfileSaving(false)
      return
    }

    const result = await updateProfile(updates)
    setProfileSaving(false)

    if (result.success) {
      const msgs = []
      if (updates.fullName) msgs.push('Naam bijgewerkt.')
      if (updates.email) msgs.push('Bevestigingsmail verstuurd naar je nieuwe e-mailadres.')
      setProfileMessage({ type: 'success', text: msgs.join(' ') })
    } else {
      setProfileMessage({ type: 'error', text: result.error })
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPasswordMessage(null)

    if (!newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Vul alle velden in.' })
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Wachtwoord moet minimaal 6 tekens zijn.' })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Wachtwoorden komen niet overeen.' })
      return
    }

    setPasswordSaving(true)
    const result = await updatePassword(newPassword)
    setPasswordSaving(false)

    if (result.success) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMessage({ type: 'success', text: 'Wachtwoord succesvol gewijzigd.' })
    } else {
      setPasswordMessage({ type: 'error', text: result.error })
    }
  }

  function MessageBox({ message }) {
    if (!message) return null
    const colors = {
      success: 'bg-success/10 border-success/20 text-success',
      error: 'bg-error/10 border-error/20 text-error',
      info: 'bg-info/10 border-info/20 text-info',
    }
    return (
      <div className={`p-3 rounded-lg border text-sm ${colors[message.type]}`}>
        {message.text}
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-brand transition-colors mb-4"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Dashboard
      </Link>

      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Mijn profiel</h1>

      {/* Profile section */}
      <form onSubmit={handleProfileSubmit} className="bg-white border border-neutral-200 rounded-xl p-6 mb-6 space-y-4">
        <h2 className="text-sm font-semibold text-neutral-700">Gegevens</h2>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Naam
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="block w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-neutral-800 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
            E-mailadres
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-neutral-800 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <MessageBox message={profileMessage} />

        <button
          type="submit"
          disabled={profileSaving}
          className="w-full bg-brand text-white font-medium py-2.5 rounded-lg hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {profileSaving ? 'Opslaan...' : 'Opslaan'}
        </button>
      </form>

      {/* Password section */}
      <form onSubmit={handlePasswordSubmit} className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-neutral-700">Wachtwoord wijzigen</h2>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Nieuw wachtwoord
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimaal 6 tekens"
            className="block w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-neutral-800 placeholder:text-neutral-400 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Bevestig wachtwoord
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Herhaal je wachtwoord"
            className="block w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-neutral-800 placeholder:text-neutral-400 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <MessageBox message={passwordMessage} />

        <button
          type="submit"
          disabled={passwordSaving}
          className="w-full bg-neutral-800 text-white font-medium py-2.5 rounded-lg hover:bg-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {passwordSaving ? 'Wijzigen...' : 'Wachtwoord wijzigen'}
        </button>
      </form>

      {/* Role badge */}
      <div className="mt-6 text-center">
        <span className="text-xs text-neutral-400">
          Rol: <span className="font-medium text-neutral-600">{user?.role === 'admin' ? 'Beheerder' : 'Medewerker'}</span>
        </span>
      </div>
    </div>
  )
}
