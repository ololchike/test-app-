import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionError } from "@/components/error"

export default function UnauthorizedPage() {
  return (
    <SectionError name="Unauthorized Content">
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="text-center space-y-4 sm:space-y-6 max-w-md w-full">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-3 sm:p-4">
            <ShieldAlert className="h-10 w-10 sm:h-12 sm:w-12 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            You don&apos;t have permission to access this page. Please contact an administrator if you believe this is an error.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="w-full sm:w-auto h-11 sm:h-10 text-sm sm:text-base">
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto h-11 sm:h-10 text-sm sm:text-base">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
    </SectionError>
  )
}
