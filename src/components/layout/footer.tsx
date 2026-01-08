import Link from "next/link"
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"

const footerNavigation = {
  tours: [
    { name: "Safari Tours", href: "/tours?type=safari" },
    { name: "Beach Holidays", href: "/tours?type=beach" },
    { name: "Mountain Trekking", href: "/tours?type=mountain" },
    { name: "Cultural Tours", href: "/tours?type=cultural" },
    { name: "Gorilla Trekking", href: "/tours?type=gorilla" },
  ],
  destinations: [
    { name: "Kenya", href: "/destinations/kenya" },
    { name: "Tanzania", href: "/destinations/tanzania" },
    { name: "Uganda", href: "/destinations/uganda" },
    { name: "Rwanda", href: "/destinations/rwanda" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Become an Agent", href: "/become-agent" },
    { name: "Careers", href: "/careers" },
    { name: "Press", href: "/press" },
  ],
  support: [
    { name: "Help Center", href: "/help" },
    { name: "Contact Us", href: "/contact" },
    { name: "Cancellation Policy", href: "/cancellation-policy" },
    { name: "Travel Insurance", href: "/travel-insurance" },
    { name: "Safety Tips", href: "/safety" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
  ],
  social: [
    { name: "Facebook", href: "https://facebook.com/safariplus", icon: Facebook },
    { name: "Twitter", href: "https://twitter.com/safariplus", icon: Twitter },
    { name: "Instagram", href: "https://instagram.com/safariplus", icon: Instagram },
    { name: "YouTube", href: "https://youtube.com/safariplus", icon: Youtube },
  ],
}

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12 lg:px-8 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid gap-8 lg:grid-cols-6">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">S+</span>
              </div>
              <span className="text-xl font-bold">SafariPlus</span>
            </Link>
            <p className="mt-4 text-sm text-secondary-foreground/80">
              Your gateway to unforgettable East African adventures. Connect with
              verified local operators for authentic safari experiences.
            </p>

            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:hello@safariplus.com" className="hover:text-primary">
                  hello@safariplus.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:+254700000000" className="hover:text-primary">
                  +254 700 000 000
                </a>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex gap-4">
              {footerNavigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-foreground/10 transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Tours */}
          <div>
            <h3 className="font-semibold">Tours</h3>
            <ul className="mt-4 space-y-3">
              {footerNavigation.tours.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-secondary-foreground/80 transition-colors hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h3 className="font-semibold">Destinations</h3>
            <ul className="mt-4 space-y-3">
              {footerNavigation.destinations.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-secondary-foreground/80 transition-colors hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold">Company</h3>
            <ul className="mt-4 space-y-3">
              {footerNavigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-secondary-foreground/80 transition-colors hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold">Support</h3>
            <ul className="mt-4 space-y-3">
              {footerNavigation.support.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-secondary-foreground/80 transition-colors hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 rounded-xl bg-secondary-foreground/5 p-6 lg:p-8">
          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
            <div>
              <h3 className="text-lg font-semibold">Subscribe to our newsletter</h3>
              <p className="mt-1 text-sm text-secondary-foreground/80">
                Get the latest safari deals and travel inspiration delivered to your inbox.
              </p>
            </div>
            <form className="flex w-full max-w-md gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg border border-secondary-foreground/20 bg-transparent px-4 py-2 text-sm placeholder:text-secondary-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-secondary-foreground/10 pt-8 lg:flex-row">
          <p className="text-sm text-secondary-foreground/60">
            &copy; {new Date().getFullYear()} SafariPlus. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6">
            {footerNavigation.legal.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm text-secondary-foreground/60 transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
