import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function AppLayout() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Top nav bar — dark, matching screenshot */}
      <header className="bg-nav text-white h-12 flex items-center px-5 shrink-0">
        <div className="flex items-center gap-6 flex-1">
          <span className="text-sm font-bold tracking-wide uppercase">Summ</span>
          <nav className="flex items-center gap-4 text-sm text-white/70">
            <NavLink to="/dashboard" className="hover:text-white transition-colors">Dashboard</NavLink>
            {isAdmin && (
              <NavLink to="/admin/gebruikers" className="hover:text-white transition-colors">Gebruikers</NavLink>
            )}
          </nav>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0) || '?'}
            </div>
            <span className="text-sm text-white/80 hidden sm:inline">{user?.name}</span>
            <svg className={`w-3.5 h-3.5 text-white/50 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
              <div className="px-3 py-2 border-b border-neutral-100">
                <p className="text-sm font-medium text-neutral-800 truncate">{user?.name}</p>
                <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
              </div>
              <Link
                to="/profiel"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Mijn profiel
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/gebruikers"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  Gebruikersbeheer
                </Link>
              )}
              <div className="border-t border-neutral-100 mt-1">
                <button
                  onClick={() => { setMenuOpen(false); handleLogout() }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  Uitloggen
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
