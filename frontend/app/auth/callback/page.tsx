"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error during auth callback:", error)
          router.push("/auth/login?error=callback_error")
          return
        }

        if (data.session) {
          // Get the stored redirect URL or default to dashboard
          const redirectUrl = localStorage.getItem('auth_redirect') || '/dashboard'
          localStorage.removeItem('auth_redirect') // Clean up

          // Successfully authenticated, redirect to intended destination
          router.push(decodeURIComponent(redirectUrl))
        } else {
          // No session found, redirect to login
          router.push("/auth/login")
        }
      } catch (error) {
        console.error("Unexpected error during auth callback:", error)
        router.push("/auth/login?error=unexpected_error")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-bold text-lg">MB</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Completing authentication...</span>
        </div>
      </div>
    </div>
  )
}
