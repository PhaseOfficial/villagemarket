import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, businessData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (data.user && !error) {
      // Create business profile
      const { error: profileError } = await supabase
        .from('businesses')
        .insert([
          {
            id: data.user.id,
            ...businessData,
          }
        ])
      
      if (profileError) {
        throw profileError
      }
    }
    
    return { data, error }
  }

  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    })
  }

  const signOut = async () => {
    return await supabase.auth.signOut()
  }

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}