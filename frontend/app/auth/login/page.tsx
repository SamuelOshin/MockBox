"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ThemeAwareLogin } from "@/components/ui/login-refined"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft } from "lucide-react"

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, signInWithGoogle, signInWithGitHub, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get redirect URL from search params
  const redirectUrl = searchParams.get('redirect') || '/dashboard'

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push(decodeURIComponent(redirectUrl))
    }
  }, [user, router, redirectUrl])

  const handleEmailSignIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      await signIn(email, password)
      // Redirect will happen in useEffect when user state changes
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      // Store redirect URL in localStorage for OAuth callback
      localStorage.setItem('auth_redirect', redirectUrl)
      await signInWithGoogle()
    } catch (error) {
      console.error("Google sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGitHubSignIn = async () => {
    try {
      setIsLoading(true)
      // Store redirect URL in localStorage for OAuth callback
      localStorage.setItem('auth_redirect', redirectUrl)
      await signInWithGitHub()
    } catch (error) {
      console.error("GitHub sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back to Home */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <ThemeAwareLogin
          title="Welcome back"
          subtitle="Sign in to your MockBox account to continue"
          onEmailSignIn={handleEmailSignIn}
          onGoogleSignIn={handleGoogleSignIn}
          onGitHubSignIn={handleGitHubSignIn}
          isLoading={isLoading}
          showSignUpLink={true}
          signUpHref="/auth/signup"
          forgotPasswordHref="/auth/forgot-password"
        />
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
