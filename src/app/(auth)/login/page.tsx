"use client"

import * as React from "react"
import { Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, getSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

function getRedirectUrl(role: string, callbackUrl: string | null): string {
  if (callbackUrl && !callbackUrl.includes("/dashboard") && callbackUrl !== "/") {
    return callbackUrl
  }

  switch (role) {
    case "ADMIN":
      return "/admin/dashboard"
    case "AGENT":
      return "/agent/dashboard"
    default:
      return "/dashboard"
  }
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  async function onSubmit(data: LoginInput) {
    setIsLoading(true)

    try {
      if (data.rememberMe) {
        localStorage.setItem("rememberMe", "true")
        localStorage.setItem("rememberedEmail", data.email)
      } else {
        localStorage.removeItem("rememberMe")
        localStorage.removeItem("rememberedEmail")
      }

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Invalid email or password")
        return
      }

      const session = await getSession()
      const userRole = session?.user?.role || "CLIENT"
      const redirectUrl = getRedirectUrl(userRole, callbackUrl)

      toast.success("Welcome back!")
      router.push(redirectUrl)
      router.refresh()
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    const rememberMe = localStorage.getItem("rememberMe") === "true"
    const rememberedEmail = localStorage.getItem("rememberedEmail")

    if (rememberMe && rememberedEmail) {
      form.setValue("email", rememberedEmail)
      form.setValue("rememberMe", true)
    }
  }, [form])

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true)
    try {
      await signIn("google", { callbackUrl: callbackUrl || undefined })
    } catch (error) {
      toast.error("Something went wrong with Google sign in")
      setIsGoogleLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 mb-2"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">Welcome Back</span>
        </motion.div>
        <h1 className="text-3xl font-bold tracking-tight">Sign in to your account</h1>
        <p className="text-muted-foreground">
          Continue your safari adventure
        </p>
      </div>

      {/* Google Sign In */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          variant="outline"
          className="w-full h-12 rounded-xl border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Continue with Google
        </Button>
      </motion.div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Email/Password Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={isLoading || isGoogleLoading}
                      className="h-12 rounded-xl border-border/50 focus:border-primary/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium">Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        disabled={isLoading || isGoogleLoading}
                        className="h-12 rounded-xl border-border/50 focus:border-primary/50 pr-12"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading || isGoogleLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Eye className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading || isGoogleLoading}
                      className="mt-0.5"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      Remember me
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-12 rounded-xl shadow-glow text-base font-semibold"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline font-semibold">
            Create one
          </Link>
        </p>

        <p className="text-center text-xs text-muted-foreground">
          Are you a tour operator?{" "}
          <Link href="/become-agent" className="text-primary hover:underline font-medium">
            Register as an agent
          </Link>
        </p>
      </motion.div>
    </motion.div>
  )
}
