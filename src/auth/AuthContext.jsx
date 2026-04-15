import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

function fallbackProfile(authUser) {
  return {
    id: authUser.id,
    email: authUser.email,
    name: authUser.email.split('@')[0],
    role: 'member',
  }
}

async function fetchProfileData(authUser) {
  if (!authUser) return null

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (error) {
      console.warn('Failed to fetch profile, using fallback:', error.message)
      return fallbackProfile(authUser)
    }

    return {
      id: authUser.id,
      email: authUser.email,
      name: profile?.full_name || authUser.email.split('@')[0],
      role: profile?.role || 'member',
    }
  } catch (err) {
    console.warn('Profile fetch error, using fallback:', err)
    return fallbackProfile(authUser)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfileData(session.user)
        setUser(profile)
      }
      setLoading(false)
    })

    // Listen for auth changes (token refresh, sign in, sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setLoading(false)
        } else if ((event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') && session?.user) {
          const profile = await fetchProfileData(session.user)
          setUser(profile)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const message = error.message === 'Invalid login credentials'
        ? 'Ongeldige inloggegevens'
        : error.message === 'Email not confirmed'
          ? 'E-mail nog niet bevestigd'
          : error.message
      return { success: false, error: message }
    }

    // Fetch profile directly after login — don't rely on onAuthStateChange
    const profile = await fetchProfileData(data.user)
    setUser(profile)
    return { success: true }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async ({ fullName, email }) => {
    const updates = {}
    if (fullName !== undefined) updates.full_name = fullName
    if (email !== undefined) updates.email = email

    const { error: profileError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (profileError) return { success: false, error: profileError.message }

    if (email && email !== user.email) {
      const { error: authError } = await supabase.auth.updateUser({ email })
      if (authError) return { success: false, error: authError.message }
    }

    setUser((prev) => ({
      ...prev,
      name: fullName !== undefined ? fullName : prev.name,
      email: email !== undefined ? email : prev.email,
    }))

    return { success: true }
  }, [user?.id, user?.email])

  const updatePassword = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { success: false, error: error.message }
    return { success: true }
  }, [])

  const isAuthenticated = !!user
  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout, updateProfile, updatePassword, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
