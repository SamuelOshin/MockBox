"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "@/components/ui/theme-provider"
import { Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react"

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

function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isValidSession, setIsValidSession] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { actualTheme } = useTheme()

  useEffect(() => {
    const validateSession = async () => {
      try {
        // Check if we have a valid session for password reset
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error || !session) {
          toast({
            title: "Invalid reset link",
            description: "This password reset link is invalid or has expired.",
            variant: "destructive",
          })
          router.push("/auth/forgot-password")
          return
        }

        setIsValidSession(true)
      } catch (error) {
        console.error("Error validating session:", error)
        router.push("/auth/forgot-password")
      } finally {
        setIsValidating(false)
      }
    }

    validateSession()
  }, [router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || !confirmPassword) return

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setIsSuccess(true)
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      })

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error: any) {
      console.error("Password reset error:", error)
      toast({
        title: "Password reset failed",
        description: error.message || "An error occurred while resetting your password.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center space-y-4">
          <MockBoxLogo className="h-12 w-12 text-foreground mx-auto" />
          <div className="text-muted-foreground">
            <span>Validating reset link...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!isValidSession) {
    return null // Will redirect in useEffect
  }

  if (isSuccess) {
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
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-foreground dark:text-foreground text-center">
                  Password updated!
                </h3>
                <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground text-center">
                  Your password has been successfully updated. You will be redirected to your dashboard shortly.
                </p>
                
                <div className="mt-6 text-center">
                  <Link
                    href="/dashboard"
                    className="font-medium text-primary hover:text-primary/90 dark:text-primary hover:dark:text-primary/90"
                  >
                    Go to dashboard →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  const isFormValid = password && confirmPassword && password === confirmPassword && password.length >= 6

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
                Reset your password
              </h3>
              <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground">
                Enter your new password below
              </p>
              
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <Label
                    htmlFor="password-reset"
                    className="text-sm font-medium text-foreground dark:text-foreground"
                  >
                    New Password
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password-reset"
                      name="password-reset"
                      autoComplete="new-password"
                      placeholder="Enter your new password (min. 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="confirmPassword-reset"
                    className="text-sm font-medium text-foreground dark:text-foreground"
                  >
                    Confirm New Password
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword-reset"
                      name="confirmPassword-reset"
                      autoComplete="new-password"
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="text-sm text-destructive mt-1">Passwords do not match</p>
                  )}
                </div>

                <Button type="submit" className="mt-4 w-full py-2 font-medium" disabled={isLoading || !isFormValid}>
                  {isLoading ? "Updating password..." : "Update password"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
