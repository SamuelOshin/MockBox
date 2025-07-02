"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/components/ui/theme-provider"
import { ArrowLeft, Mail } from "lucide-react"

// MockBox Logo component for consistency
const MockBoxLogo = (props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 48 48"
    fill="none"
    {...props}
  >
    <path 
      fill="currentColor" 
      fillRule="evenodd" 
      d="m7.839 40.783 16.03-28.054L20 6 0 40.783h7.839Zm8.214 0H40L27.99 19.894l-4.02 7.032 3.976 6.914H20.02l-3.967 6.943Z" 
      clipRule="evenodd"
    />
  </svg>
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { resetPassword } = useAuth()
  const { actualTheme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    try {
      setIsLoading(true)
      await resetPassword(email)
      setIsSubmitted(true)
    } catch (error) {
      console.error("Password reset error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center justify-center">
            <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
              <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex items-center space-x-1.5 justify-center">
                  <Mail className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-foreground dark:text-foreground text-center">
                  Check your email
                </h3>
                <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground text-center">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  <p>
                    Didn't receive the email? Check your spam folder or{" "}
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="text-primary hover:underline font-medium"
                    >
                      try again
                    </button>
                  </p>
                </div>

                <div className="mt-6 text-center">
                  <Link
                    href="/auth/login"
                    className="font-medium text-primary hover:text-primary/90 dark:text-primary hover:dark:text-primary/90"
                  >
                    ← Back to sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back to Login */}
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <div className="flex items-center justify-center">
          <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <div className="flex items-center space-x-1.5">
                <MockBoxLogo
                  className="h-7 w-7 text-foreground dark:text-foreground"
                  aria-hidden={true}
                />
                <p className="font-medium text-lg text-foreground dark:text-foreground">
                  MockBox
                </p>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground dark:text-foreground">
                Forgot your password?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password
              </p>
              
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <Label
                    htmlFor="email-reset"
                    className="text-sm font-medium text-foreground dark:text-foreground"
                  >
                    Email
                  </Label>
                  <Input
                    type="email"
                    id="email-reset"
                    name="email-reset"
                    autoComplete="email"
                    placeholder="Enter your email address"
                    className="mt-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="mt-4 w-full py-2 font-medium" disabled={isLoading || !email}>
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>
              </form>
              
              <p className="mt-6 text-sm text-muted-foreground dark:text-muted-foreground text-center">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-primary hover:text-primary/90 dark:text-primary hover:dark:text-primary/90"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
