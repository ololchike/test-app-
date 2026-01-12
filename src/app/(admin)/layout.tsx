import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Only allow admin users
  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      <AdminSidebar user={session.user} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={session.user} />
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-transparent to-muted/20 p-6">
          <div className="animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
