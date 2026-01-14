import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Star, MapPin, Clock } from "lucide-react"

interface EmbedPageProps {
  params: Promise<{ id: string }>
}

export default async function AgentEmbedPage({ params }: EmbedPageProps) {
  const { id } = await params

  // Get agent with their tours
  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      tours: {
        where: { status: "ACTIVE" },
        orderBy: { viewCount: "desc" },
        take: 6,
        include: {
          _count: {
            select: { reviews: true },
          },
          reviews: {
            where: { isApproved: true },
            select: { rating: true },
          },
        },
      },
    },
  })

  if (!agent) {
    notFound()
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://safariplus.com"

  return (
    <html>
      <head>
        <title>{agent.businessName} - Tours</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f9fafb;
            padding: 16px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header h1 {
            font-size: 18px;
            color: #111;
            margin-bottom: 4px;
          }
          .header p {
            font-size: 13px;
            color: #666;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
          }
          .card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            text-decoration: none;
            color: inherit;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .card:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .card-image {
            position: relative;
            aspect-ratio: 16/10;
            background: #e5e7eb;
          }
          .card-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .card-content {
            padding: 12px;
          }
          .card-location {
            font-size: 12px;
            color: #f97316;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .card-title {
            font-size: 15px;
            font-weight: 600;
            color: #111;
            margin-bottom: 8px;
            line-height: 1.3;
          }
          .card-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #666;
          }
          .card-rating {
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .card-rating svg {
            color: #fbbf24;
            fill: #fbbf24;
          }
          .card-price {
            font-weight: 600;
            color: #111;
            font-size: 16px;
          }
          .powered-by {
            text-align: center;
            margin-top: 20px;
            font-size: 11px;
            color: #999;
          }
          .powered-by a {
            color: #f97316;
            text-decoration: none;
          }
        `}</style>
      </head>
      <body>
        <div className="header">
          <h1>{agent.businessName}</h1>
          <p>{agent.tours.length} tours available</p>
        </div>

        <div className="grid">
          {agent.tours.map((tour) => {
            const avgRating = tour.reviews.length > 0
              ? tour.reviews.reduce((sum, r) => sum + r.rating, 0) / tour.reviews.length
              : null

            return (
              <a
                key={tour.id}
                href={`${baseUrl}/tours/${tour.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="card"
              >
                <div className="card-image">
                  {tour.coverImage && (
                    <img src={tour.coverImage} alt={tour.title} />
                  )}
                </div>
                <div className="card-content">
                  <div className="card-location">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {tour.destination}, {tour.country}
                  </div>
                  <div className="card-title">{tour.title}</div>
                  <div className="card-meta">
                    <span>{tour.durationDays} days</span>
                    {avgRating && (
                      <div className="card-rating">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        {avgRating.toFixed(1)} ({tour._count.reviews})
                      </div>
                    )}
                    <div className="card-price">${tour.basePrice}</div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>

        <div className="powered-by">
          Powered by <a href={baseUrl} target="_blank" rel="noopener noreferrer">SafariPlus</a>
        </div>
      </body>
    </html>
  )
}
