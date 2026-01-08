import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Form */}
      <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">S+</span>
            </div>
            <span className="text-xl font-bold text-foreground">SafariPlus</span>
          </Link>

          {children}
        </div>
      </div>

      {/* Right Panel - Image/Brand */}
      <div className="hidden lg:block relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-secondary/80 to-secondary">
          <div
            className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2068')",
            }}
          />
        </div>
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <div />
          <div>
            <blockquote className="text-2xl font-semibold leading-relaxed">
              &ldquo;SafariPlus made our dream African safari a reality. From booking to
              the actual experience, everything was perfect.&rdquo;
            </blockquote>
            <div className="mt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-white/20" />
              <div>
                <p className="font-semibold">Sarah & Michael Thompson</p>
                <p className="text-sm text-white/80">Serengeti Safari, 2024</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/60">
              Trusted by 10,000+ travelers worldwide
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
