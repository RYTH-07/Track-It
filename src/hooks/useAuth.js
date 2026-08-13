import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { ALLOWED_DOMAIN, DOMAIN_ERROR, PROFESSOR_EMAIL } from '../lib/constants.js'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  const fetchProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (data) {
      setProfile(data)
      setNeedsOnboarding(!data.display_name || data.display_name.trim() === '')
    }
    return data
  }, [])

  useEffect(() => {
    let settled = false
    const finishLoading = () => {
      if (!settled) {
        settled = true
        setLoading(false)
      }
    }

    // Primary path: read the current session once on mount.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      }
      finishLoading()
    }).catch(() => {
      finishLoading()
    })

    // Listen for auth changes. onAuthStateChange also fires once on setup
    // (INITIAL_SESSION), which acts as a second, independent path to
    // unblock loading if getSession() above ever hangs — a known
    // supabase-js issue where getSession() can wait indefinitely on the
    // browser's Web Locks API in some multi-tab/stale-session cases,
    // which matches "site is stuck loading until I refresh."
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setNeedsOnboarding(false)
      }
      finishLoading()
    })

    // Absolute safety net: never let the loading screen hang forever even
    // if both paths above stall.
    const timeoutId = setTimeout(finishLoading, 8000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [fetchProfile])

  const signUp = async (email, password) => {
    const domain = email.split('@')[1]
    const isProfessorEmail = email.trim().toLowerCase() === PROFESSOR_EMAIL.trim().toLowerCase()
    if (domain !== ALLOWED_DOMAIN && !isProfessorEmail) {
      return { error: { message: DOMAIN_ERROR } }
    }
    const { data, error } = await supabase.auth.signUp({ email, password })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateDisplayName = async (displayName) => {
    if (!user) return { error: { message: 'Not authenticated' } }
    const { data, error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('user_id', user.id)
      .select()
      .single()
    if (data) {
      setProfile(data)
      setNeedsOnboarding(false)
    }
    return { data, error }
  }

  const updateLeetCodeUsername = async (leetcodeUsername) => {
    if (!user) return { error: { message: 'Not authenticated' } }
    const { data, error } = await supabase
      .from('profiles')
      .update({ leetcode_username: leetcodeUsername || null })
      .eq('user_id', user.id)
      .select()
      .single()
    if (data) setProfile(data)
    return { data, error }
  }
  const resetPassword = async (email) => {
  const domain = email.split('@')[1]
  if (domain !== ALLOWED_DOMAIN) {
    return { error: { message: DOMAIN_ERROR } }
  }
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  return { data, error }
}

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id)
  }, [user, fetchProfile])

  const isProfessor = !!user?.email && user.email.trim().toLowerCase() === PROFESSOR_EMAIL.trim().toLowerCase()

return { user, profile, loading, needsOnboarding, isProfessor, signUp, signIn, signOut, updateDisplayName, updateLeetCodeUsername, refreshProfile, resetPassword }}
