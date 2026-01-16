import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Package, ShoppingBag, Users, LayoutGrid, Settings, Home, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Not logged in - redirect to admin login
  if (!user) {
    redirect("/admin/login")
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from("users")
    .select("is_admin, full_name, email")
    .eq("id", user.id)
    .maybeSingle()

  // Not an admin - redirect to admin login  
  if (!userData || !userData.is_admin) {
    redirect("/admin/login")
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/40">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Home className="h-5 w-5" />
            <span>Back to Store</span>
          </Link>
        </div>
        
        <div className="flex flex-col justify-between h-[calc(100vh-4rem)]">
          <nav className="flex flex-col gap-2 p-4">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <LayoutGrid className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <Package className="h-4 w-4" />
              Products
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <ShoppingBag className="h-4 w-4" />
              Orders
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <LayoutGrid className="h-4 w-4" />
              Categories
            </Link>
            <Link
              href="/admin/customers"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <Users className="h-4 w-4" />
              Customers
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>

          <div className="border-t p-4">
            <div className="mb-3 px-3">
              <p className="text-sm font-medium">{userData.full_name || "Admin"}</p>
              <p className="text-xs text-muted-foreground truncate">{userData.email}</p>
            </div>
            <form action="/api/auth/logout" method="POST">
              <Button variant="ghost" className="w-full justify-start" type="submit">
                <LogOut className="mr-3 h-4 w-4" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </aside>
      <main className="flex-1">
        <div className="container py-6">{children}</div>
      </main>
    </div>
  )
}
