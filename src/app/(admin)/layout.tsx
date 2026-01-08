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
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar user={session.user} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={session.user} />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
