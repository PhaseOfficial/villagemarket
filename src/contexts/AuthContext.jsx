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

  // 1. Sign Up (User Account Creation)
  // businessData is now optional (= null). If not provided, it just creates the user.
  const signUp = async (email, password, businessData = null) => {
    // A. Create the User in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    // B. Only if businessData is provided, create the profile immediately
    if (data.user && !error && businessData) {
      const { error: profileError } = await supabase
        .from('businesses')
        .insert([
          {
            owner_id: data.user.id,
            ...businessData,
            approved: false
          }
        ])
      
      if (profileError) {
        console.error("Error creating business profile:", profileError)
        // Ideally we might want to revert the auth creation here, 
        // but for now we just throw the error.
        throw profileError
      }
    }
    
    return { data, error }
  }

  // 2. Create Business (For EXISTING, Logged-in Users)
  // This is called from the Dashboard
  const createBusiness = async (businessData) => {
    // Get current user ID safely
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error("You must be logged in to create a business")

    const { data, error } = await supabase
      .from('businesses')
      .insert([
        {
          owner_id: user.id, // Links to the logged-in user
          ...businessData,
          approved: false
        }
      ])
      .select()

    if (error) throw error
    return data
  }

  // 3. Sign In
  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    })
  }

  // 4. Sign Out
  const signOut = async () => {
    return await supabase.auth.signOut()
  }

  // 5. Password Reset (Step 1: Send Email)
  const resetPassword = (email) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/update-password',
    })
  }

  // 6. Update Password (Step 2: Save new password)
  const updateUserPassword = (newPassword) => {
    return supabase.auth.updateUser({ password: newPassword })
  }

  const value = {
    user,
    signUp,
    createBusiness,
    signIn,
    signOut,
    resetPassword,
    updateUserPassword,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}