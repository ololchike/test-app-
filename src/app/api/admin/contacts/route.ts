import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createLogger } from "@/lib/logger"

const log = createLogger("Admin Contacts API")

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { subject: { contains: search } },
        { message: { contains: search } },
      ]
    }

    const skip = (page - 1) * limit

    const [messages, total, statusCounts] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        include: {
          assignedAgent: {
            select: {
              businessName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
      }),
    ])

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
      statusCounts: statusCounts.reduce(
        (acc, item) => {
          acc[item.status] = item._count.id
          return acc
        },
        {} as Record<string, number>
      ),
    })
  } catch (error) {
    log.error("Error fetching contact messages", error)
    return NextResponse.json(
      { error: "Failed to fetch contact messages" },
      { status: 500 }
    )
  }
}
