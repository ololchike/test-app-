"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Eye, EyeOff, Check, X, Briefcase, ArrowRight, Mail, Building2, MapPin, Shield, Phone } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

import { agentSignupSchema, type AgentSignupInput } from "@/lib/validations/auth"
import { useBotProtection } from "@/lib/hooks/use-bot-protection"
import { agentSignupAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { SectionError } from "@/components/error"

// East African countries
const countries = [
  "Kenya",
  "Tanzania",
  "Uganda",
  "Rwanda",
  "Ethiopia",
  "Other",
]

// Password strength indicator
function PasswordStrength({ password }: { password: string }) {
  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
  ]

  if (!password) return null

  const metCount = requirements.filter(r => r.met).length
  const strength = metCount === 4 ? "Strong" : metCount >= 2 ? "Medium" : "Weak"
  const strengthColor = metCount === 4 ? "bg-green-500" : metCount >= 2 ? "bg-amber-500" : "bg-red-500"

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="space-y-3 mt-3"
    >
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span className={cn(
            "font-medium",
            metCount === 4 ? "text-green-600" : metCount >= 2 ? "text-amber-600" : "text-red-600"
          )}>
            {strength}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(metCount / 4) * 100}%` }}
            className={cn("h-full rounded-full", strengthColor)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {requirements.map((req) => (
          <div key={req.label} className="flex items-center gap-2 text-xs">
            <div className={cn(
              "h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0",
              req.met ? "bg-green-100 dark:bg-green-900/30" : "bg-muted"
            )}>
              {req.met ? (
                <Check className="h-2.5 w-2.5 text-green-600" />
              ) : (
                <X className="h-2.5 w-2.5 text-muted-foreground" />
              )}
            </div>
            <span className={cn(
              "truncate",
              req.met ? "text-green-600" : "text-muted-foreground"
            )}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default function BecomeAgentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [registrationSuccess, setRegistrationSuccess] = React.useState(false)
  const [userEmail, setUserEmail] = React.useState("")
  const [step, setStep] = React.useState(1)
  const { honeypotProps, checkIsBot } = useBotProtection()

  const form = useForm<AgentSignupInput>({
    resolver: zodResolver(agentSignupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      businessName: "",
      businessEmail: "",
      businessPhone: "",
      country: "",
      city: "",
      address: "",
      description: "",
      licenseNumber: "",
      katoMember: false,
      tatoMember: false,
      autoMember: false,
      acceptTerms: false,
    },
  })

  const watchPassword = form.watch("password")

  async function onSubmit(data: AgentSignupInput) {
    // Bot protection check
    if (checkIsBot()) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.error("Unable to create account. Please try again.")
      return
    }

    setIsLoading(true)

    try {
      const result = await agentSignupAction(data)

      if (!result.success) {
        toast.error(result.error)
        return
      }

      setUserEmail(data.email)
      setRegistrationSuccess(true)
      toast.success("Application submitted! Please check your email.")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = async () => {
    let fieldsToValidate: (keyof AgentSignupInput)[] = []

    if (step === 1) {
      fieldsToValidate = ["name", "email", "phone", "password"]
    } else if (step === 2) {
      fieldsToValidate = ["businessName", "country", "city"]
    }

    const result = await form.trigger(fieldsToValidate)
    if (result) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  // Show success message after registration
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container max-w-2xl mx-auto py-16 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-8 shadow-lg border"
          >
            <div className="space-y-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="mx-auto w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center"
              >
                <Mail className="h-10 w-10 text-green-600" />
              </motion.div>
              <h1 className="text-3xl font-bold tracking-tight">Application Submitted!</h1>
              <p className="text-muted-foreground">
                We&apos;ve sent a verification link to
              </p>
              <p className="font-semibold text-lg">{userEmail}</p>

              <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 space-y-4 border border-primary/10 text-left">
                <h2 className="font-semibold">What happens next?</h2>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
                    <span>Verify your email by clicking the link we sent</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</span>
                    <span>Our team will review your application within 24-48 hours</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</span>
                    <span>Once approved, you can start listing your tours</span>
                  </li>
                </ol>
              </div>

              <div className="pt-4">
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <SectionError name="Become Agent Hero">
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <div className="container max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
              <Briefcase className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Partner With Us</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Become a Safari Partner
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join our network of trusted tour operators and reach thousands of travelers looking for authentic African safari experiences.
            </p>
          </motion.div>
        </div>
      </section>
      </SectionError>

      {/* Benefits Section */}
      <SectionError name="Agent Benefits">
      <section className="py-8 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Building2,
                title: "Expand Your Reach",
                description: "Access a global audience of safari enthusiasts"
              },
              {
                icon: Shield,
                title: "Verified Badge",
                description: "Build trust with our verification program"
              },
              {
                icon: Phone,
                title: "Dedicated Support",
                description: "24/7 partner support and resources"
              }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl p-6 border"
              >
                <benefit.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      </SectionError>

      {/* Registration Form */}
      <SectionError name="Become Agent Form">
      <section className="py-8 px-4 pb-16">
        <div className="container max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-6 md:p-8 shadow-lg border"
          >
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                      step >= s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      className={cn(
                        "w-16 h-1 rounded-full transition-colors",
                        step > s ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                {step === 1 && "Personal Information"}
                {step === 2 && "Business Details"}
                {step === 3 && "Certifications & Terms"}
              </h2>
              <p className="text-muted-foreground">
                {step === 1 && "Tell us about yourself"}
                {step === 2 && "Tell us about your tour business"}
                {step === 3 && "Final details to complete your application"}
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Honeypot field */}
                <input
                  type="text"
                  name="company"
                  placeholder="Your company"
                  {...honeypotProps}
                />

                {/* Step 1: Personal Information */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Doe"
                              autoComplete="name"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              autoComplete="email"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+254 700 000 000"
                              autoComplete="tel"
                              disabled={isLoading}
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
                          <FormLabel>Password *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a strong password"
                                autoComplete="new-password"
                                disabled={isLoading}
                                className="pr-12"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-5 w-5 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <PasswordStrength password={watchPassword} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {/* Step 2: Business Details */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Safari Adventures Ltd"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="businessEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="info@company.com"
                                disabled={isLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="businessPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Phone</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="+254 700 000 000"
                                disabled={isLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {countries.map((country) => (
                                  <SelectItem key={country} value={country}>
                                    {country}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nairobi"
                                disabled={isLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="123 Safari Street, Nairobi"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about your tour company, specialties, and experience..."
                              className="min-h-[100px]"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Max 2000 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {/* Step 3: Certifications & Terms */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="licenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tourism License Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="TLA/2024/001"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            If you have a tourism license, enter the number here
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <p className="text-sm font-medium">Industry Memberships</p>
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="katoMember"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="cursor-pointer">
                                  KATO Member
                                </FormLabel>
                                <FormDescription>
                                  Kenya Association of Tour Operators
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="tatoMember"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="cursor-pointer">
                                  TATO Member
                                </FormLabel>
                                <FormDescription>
                                  Tanzania Association of Tour Operators
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="autoMember"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="cursor-pointer">
                                  AUTO Member
                                </FormLabel>
                                <FormDescription>
                                  Association of Uganda Tour Operators
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="acceptTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg bg-muted/30 border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              I agree to the{" "}
                              <Link href="/terms" className="text-primary hover:underline font-medium">
                                Terms of Service
                              </Link>
                              ,{" "}
                              <Link href="/privacy" className="text-primary hover:underline font-medium">
                                Privacy Policy
                              </Link>
                              , and{" "}
                              <Link href="/terms" className="text-primary hover:underline font-medium">
                                Partner Agreement
                              </Link>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-4">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Back
                    </Button>
                  )}

                  {step < 3 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Application
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </section>
      </SectionError>
    </div>
  )
}
