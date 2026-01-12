import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/activity
 * Fetch recent platform activity from audit logs
 * Requires ADMIN role
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate and authorize
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      )
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    // Get limit from query params, default to 10
    const searchParams = req.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "10", 10)

    // Fetch recent audit logs
    const recentLogs = await prisma.auditLog.findMany({
      where: {
        action: {
          in: [
            "booking_created",
            "booking_confirmed",
            "booking_cancelled",
            "agent_verified",
            "agent_suspended",
            "withdrawal_processed",
            "withdrawal_approved",
            "withdrawal_rejected",
            "payment_completed",
            "tour_published",
            "user_registered",
          ],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    // Format activity items
    const activities = recentLogs.map((log) => {
      const now = new Date()
      const logTime = new Date(log.createdAt)
      const diffInMs = now.getTime() - logTime.getTime()
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

      let timeAgo: string
      if (diffInMinutes < 60) {
        timeAgo = diffInMinutes === 0 ? "just now" : `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
      } else if (diffInHours < 24) {
        timeAgo = `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
      } else {
        timeAgo = `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
      }

      // Determine activity type and message
      let type: string
      let message: string
      let icon: string
      let iconColor: string

      switch (log.action) {
        case "booking_created":
        case "booking_confirmed":
          type = "booking"
          message = `New booking ${log.resourceId ? `#${log.resourceId}` : ""} confirmed`
          icon = "CheckCircle"
          iconColor = "text-green-500"
          break

        case "booking_cancelled":
          type = "booking"
          message = `Booking ${log.resourceId ? `#${log.resourceId}` : ""} cancelled`
          icon = "Clock"
          iconColor = "text-muted-foreground"
          break

        case "agent_verified":
          type = "agent"
          const agentName = (log.metadata as any)?.agentName || "Agent"
          message = `Agent ${agentName} verified`
          icon = "Shield"
          iconColor = "text-blue-500"
          break

        case "agent_suspended":
          type = "alert"
          const suspendedAgent = (log.metadata as any)?.agentName || "Agent"
          message = `Agent ${suspendedAgent} suspended`
          icon = "AlertTriangle"
          iconColor = "text-amber-500"
          break

        case "withdrawal_processed":
        case "withdrawal_approved":
          type = "withdrawal"
          const amount = (log.metadata as any)?.amount || 0
          message = `Withdrawal ${log.resourceId ? `#${log.resourceId}` : ""} processed - $${amount.toLocaleString()}`
          icon = "CreditCard"
          iconColor = "text-purple-500"
          break

        case "withdrawal_rejected":
          type = "alert"
          message = `Withdrawal ${log.resourceId ? `#${log.resourceId}` : ""} rejected`
          icon = "AlertTriangle"
          iconColor = "text-amber-500"
          break

        case "payment_completed":
          type = "booking"
          const paymentAmount = (log.metadata as any)?.amount || 0
          message = `Payment completed - $${paymentAmount.toLocaleString()}`
          icon = "CheckCircle"
          iconColor = "text-green-500"
          break

        case "tour_published":
          type = "booking"
          const tourTitle = (log.metadata as any)?.title || "Tour"
          message = `New tour published: ${tourTitle}`
          icon = "CheckCircle"
          iconColor = "text-blue-500"
          break

        case "user_registered":
          type = "booking"
          message = `New user registered`
          icon = "CheckCircle"
          iconColor = "text-green-500"
          break

        default:
          type = "booking"
          message = log.action.replace(/_/g, " ")
          icon = "Clock"
          iconColor = "text-muted-foreground"
      }

      return {
        id: log.id,
        type,
        message,
        time: timeAgo,
        icon,
        iconColor,
        createdAt: log.createdAt,
      }
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error("Admin activity API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch recent activity" },
      { status: 500 }
    )
  }
}
