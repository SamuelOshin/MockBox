"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User, Session, AuthError } from "@supabase/supabase-js"
import { supabase } from "./supabase"
import { toast } from "sonner"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: any) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGitHub: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (updates: any) => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasShownWelcome, setHasShownWelcome] = useState(false) // Track if we've shown welcome message
  // use sonner's toast directly

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error

        setSession(session)
        setUser(session?.user ?? null)
        
        // If user is already signed in on initial load, mark welcome as shown
        if (session?.user) {
          setHasShownWelcome(true)
        }
      } catch (error) {
        console.error("Error getting session:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // console.log("Auth state changed:", event, session?.user?.email)

        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            // Only show welcome message for actual sign-ins, not session restorations
            if (!hasShownWelcome) {
              toast.success("Welcome back! 🎉", {
                description: "You have been signed in successfully."
              })
              setHasShownWelcome(true)
            }
            break
          case 'SIGNED_OUT':
            toast("Signed out", {
              description: "You have been signed out successfully."
            })
            setHasShownWelcome(false) // Reset welcome flag on sign out
            break
          case 'TOKEN_REFRESHED':
            // Silent token refresh - no toast needed
            break
          case 'USER_UPDATED':
            toast.success("Profile updated", {
              description: "Your profile has been updated successfully."
            })
            break
          case 'PASSWORD_RECOVERY':
            toast("Password recovery", {
              description: "Check your email for password reset instructions."
            })
            break        }
      }
    )

    return () => subscription.unsubscribe()
  }, [toast, hasShownWelcome])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
    } catch (error) {
      const authError = error as AuthError
      toast.error("Sign in failed", {
        description: authError.message || "An error occurred during sign in"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, metadata = {}) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })

      if (error) throw error

      toast("Check your email", {
        description: "We've sent you a confirmation link to complete your registration."
      })
    } catch (error) {
      const authError = error as AuthError
      toast.error("Sign up failed", {
        description: authError.message || "An error occurred during sign up"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      const authError = error as AuthError
      toast.error("Sign out failed", {
        description: authError.message || "An error occurred during sign out"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }
  const signInWithGoogle = async () => {
    try {
      setLoading(true)

      // Store current redirect URL for OAuth callback
      const urlParams = new URLSearchParams(window.location.search)
      const redirectUrl = urlParams.get('redirect') || '/dashboard'
      localStorage.setItem('auth_redirect', redirectUrl)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error) {
      const authError = error as AuthError
      toast.error("Google sign in failed", {
        description: authError.message || "An error occurred during Google sign in"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }
  const signInWithGitHub = async () => {
    try {
      setLoading(true)

      // Store current redirect URL for OAuth callback
      const urlParams = new URLSearchParams(window.location.search)
      const redirectUrl = urlParams.get('redirect') || '/dashboard'
      localStorage.setItem('auth_redirect', redirectUrl)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error) {
      const authError = error as AuthError
      toast.error("GitHub sign in failed", {
        description: authError.message || "An error occurred during GitHub sign in"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      toast("Password reset sent", {
        description: "Check your email for password reset instructions."
      })
    } catch (error) {
      const authError = error as AuthError
      toast.error("Password reset failed", {
        description: authError.message || "An error occurred during password reset"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: any) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.updateUser({
        data: updates,
      })

      if (error) throw error
    } catch (error) {
      const authError = error as AuthError
      toast.error("Profile update failed", {
        description: authError.message || "An error occurred while updating profile"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithGitHub,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
