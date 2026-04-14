import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    const result = await login(email, password)
    setIsLoading(false)
    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-darker to-nav px-4">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-sm">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand rounded-xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Summ Tools</h1>
          <p className="text-neutral-500 text-sm mt-1">Log in om aan de slag te gaan</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
              E-mailadres
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="je@getsumm.co"
              required
              className="block w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-neutral-800 placeholder:text-neutral-400 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Wachtwoord
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Voer je wachtwoord in"
              required
              className="block w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-neutral-800 placeholder:text-neutral-400 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-error-light px-3.5 py-2.5 text-sm text-error">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand text-white font-medium py-2.5 rounded-lg hover:bg-brand-light active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Even geduld...' : 'Inloggen'}
          </button>
        </form>

        <p className="mt-6 text-xs text-neutral-400 text-center">
          Log in met je Summ Tools account
        </p>
      </div>
    </div>
  )
}
