import Link from "next/link"
import { Home, Search, ArrowLeft, Compass } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center">
          {/* Large 404 with safari theme */}
          <div className="relative">
            <div className="text-[150px] sm:text-[200px] font-bold text-primary/10 select-none leading-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Compass className="h-24 w-24 sm:h-32 sm:w-32 text-primary animate-pulse" />
            </div>
          </div>

          {/* Message */}
          <div className="mt-8 space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Lost in the Safari?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Looks like you've wandered off the beaten path. The page you're looking
              for doesn't exist or may have been moved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex flex-wrap gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/tours">
                <Search className="mr-2 h-5 w-5" />
                Browse Tours
              </Link>
            </Button>
          </div>

          {/* Popular Links */}
          <div className="mt-16">
            <Card className="border-2">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold mb-6">
                  Looking for something specific?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    href="/tours"
                    className="group flex items-center gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Search className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Safari Tours</div>
                      <div className="text-sm text-muted-foreground">
                        Explore our tour packages
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/destinations"
                    className="group flex items-center gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Compass className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Destinations</div>
                      <div className="text-sm text-muted-foreground">
                        Discover amazing places
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/about"
                    className="group flex items-center gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <svg
                        className="h-5 w-5 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">About Us</div>
                      <div className="text-sm text-muted-foreground">
                        Learn more about SafariPlus
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/contact"
                    className="group flex items-center gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <svg
                        className="h-5 w-5 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">Contact Us</div>
                      <div className="text-sm text-muted-foreground">
                        Get in touch with our team
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Back Link */}
          <div className="mt-8">
            <Button variant="ghost" asChild>
              <Link href="javascript:history.back()" className="group">
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Go back to previous page
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
