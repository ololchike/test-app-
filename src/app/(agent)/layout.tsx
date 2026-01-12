import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AgentSidebar } from "@/components/agent/sidebar"
import { AgentHeader } from "@/components/agent/header"

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Check if user is an agent or admin
  if (session.user.role !== "AGENT" && session.user.role !== "ADMIN") {
    redirect("/unauthorized")
  }

  // Fetch agent data from database
  const agent = await prisma.agent.findUnique({
    where: { userId: session.user.id },
    select: {
      businessName: true,
      isVerified: true,
    },
  })

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      <AgentSidebar
        user={session.user}
        agent={agent || undefined}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AgentHeader user={session.user} />
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-transparent to-muted/20 p-6">
          <div className="animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
