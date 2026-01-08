"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, CheckCircle, AlertCircle, Mail } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [isVerifying, setIsVerifying] = React.useState(!!token)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [isError, setIsError] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState("")
  const [isResending, setIsResending] = React.useState(false)
  const [email, setEmail] = React.useState("")

  // Auto-verify if token is present
  React.useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setIsVerifying(false)
        return
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (!response.ok) {
          setIsError(true)
          setErrorMessage(data.message || "Failed to verify email. The link may have expired.")
          toast.error(data.message || "Email verification failed")
          return
        }

        setIsSuccess(true)
        toast.success("Email verified successfully!")
      } catch (error) {
        setIsError(true)
        setErrorMessage("Something went wrong. Please try again.")
        toast.error("Something went wrong. Please try again.")
      } finally {
        setIsVerifying(false)
      }
    }

    verifyEmail()
  }, [token])

  async function handleResendVerification() {
    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    setIsResending(true)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || "Failed to resend verification email")
        return
      }

      toast.success("Verification email sent! Check your inbox.")
      setEmail("")
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  // Loading state while verifying
  if (isVerifying) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-center">
            Verifying your email
          </h1>
          <p className="text-muted-foreground text-center">
            Please wait while we verify your email address...
          </p>
        </div>
      </div>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-[#16a34a]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-center">
            Email verified!
          </h1>
          <p className="text-muted-foreground text-center">
            Your email has been successfully verified. You can now access your account.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/dashboard" className="block">
            <Button className="w-full">
              Continue to dashboard
            </Button>
          </Link>

          <Link href="/login" className="block">
            <Button variant="outline" className="w-full">
              Go to login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-center">
            Verification failed
          </h1>
          <p className="text-muted-foreground text-center">
            {errorMessage}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Enter your email to resend verification
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isResending}
              />
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleResendVerification}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Resend verification email"
            )}
          </Button>

          <Link href="/login" className="block">
            <Button variant="outline" className="w-full">
              Back to login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Default state - no token
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-center">
          Check your email
        </h1>
        <p className="text-muted-foreground text-center">
          We&apos;ve sent a verification link to your email address. Click the link to verify your account.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium">Didn&apos;t receive the email?</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Check your spam or junk folder</li>
            <li>Make sure you entered the correct email address</li>
            <li>Wait a few minutes and try again</li>
          </ul>
        </div>

        <div className="space-y-2">
          <label htmlFor="resend-email" className="text-sm font-medium">
            Resend verification email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="resend-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isResending}
            />
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleResendVerification}
          disabled={isResending}
        >
          {isResending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Resend verification email"
          )}
        </Button>

        <Link href="/login" className="block">
          <Button variant="outline" className="w-full">
            Back to login
          </Button>
        </Link>
      </div>
    </div>
  )
}
