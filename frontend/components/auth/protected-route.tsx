"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"
import { EngineSpinner } from "@/components/ui/engine-spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      // Store the current path as the redirect destination
      const redirectUrl = encodeURIComponent(pathname)
      router.push(`/auth/login?redirect=${redirectUrl}`)
    }
  }, [user, loading, router, pathname])

  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center">
              <EngineSpinner size={48} color="#6366f1" />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground justify-center">
              <span className="font-bold tracking-tight text-lg text-slate-800 dark:text-slate-100">
                Loading...
              </span>
            </div>
          </div>
        </div>
      )
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}
