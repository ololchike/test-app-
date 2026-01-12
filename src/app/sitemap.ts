import { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  // Get all active tours
  const tours = await prisma.tour.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, updatedAt: true },
  })

  // Get unique countries for destination pages
  const destinations = await prisma.tour.findMany({
    where: { status: "ACTIVE" },
    distinct: ["country"],
    select: { country: true },
  })

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/tours`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/destinations`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/become-agent`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ]

  // Tour pages
  const tourPages: MetadataRoute.Sitemap = tours.map((tour) => ({
    url: `${baseUrl}/tours/${tour.slug}`,
    lastModified: tour.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  // Destination pages
  const destinationPages: MetadataRoute.Sitemap = destinations.map((dest) => ({
    url: `${baseUrl}/destinations/${dest.country.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  return [...staticPages, ...tourPages, ...destinationPages]
}
