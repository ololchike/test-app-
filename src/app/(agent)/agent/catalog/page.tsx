"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Car, Hotel, ArrowRight, Package } from "lucide-react"

export default function CatalogPage() {
  const catalogSections = [
    {
      title: "Activity Add-ons",
      description: "Manage your catalog of optional activities like hot air balloon rides, cultural visits, and more.",
      icon: Sparkles,
      href: "/agent/catalog/addons",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Vehicles",
      description: "Manage your fleet of safari vehicles including Land Cruisers, vans, and overland trucks.",
      icon: Car,
      href: "/agent/catalog/vehicles",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Accommodations",
      description: "Manage lodges, camps, and hotels from budget to ultra-luxury tiers.",
      icon: Hotel,
      href: "/agent/catalog/accommodations",
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
  ]

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Package className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">My Catalog</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Manage your global catalog of add-ons, vehicles, and accommodations. Items in your catalog can be
          reused across multiple tours with custom pricing per tour.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {catalogSections.map((section) => (
          <Card key={section.href} className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className={`w-12 h-12 rounded-lg ${section.bgColor} flex items-center justify-center mb-3`}>
                <section.icon className={`h-6 w-6 ${section.color}`} />
              </div>
              <CardTitle className="flex items-center justify-between">
                {section.title}
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={section.href}>Manage {section.title}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
