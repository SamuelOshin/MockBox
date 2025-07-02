"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ThemeAwareSignUp } from "@/components/ui/signup-refined"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft } from "lucide-react"

function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { signUp, signInWithGoogle, signInWithGitHub, user } = useAuth()
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

  const handleEmailSignUp = async (formData: any) => {
    try {
      setIsLoading(true)
      await signUp(formData.email, formData.password, { 
        full_name: formData.fullName 
      })
      // User will be redirected after email confirmation
    } catch (error) {
      console.error("Sign up error:", error)
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

        <ThemeAwareSignUp
          title="Create your account"
          subtitle="Start building amazing mock APIs with MockBox"
          onEmailSignUp={handleEmailSignUp}
          onGoogleSignIn={handleGoogleSignIn}
          onGitHubSignIn={handleGitHubSignIn}
          isLoading={isLoading}
          showSignInLink={true}
          signInHref="/auth/login"
          termsHref="/terms"
          privacyHref="/privacy"
        />
      </motion.div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignUpForm />
    </Suspense>
  )
}
