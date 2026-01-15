import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Package, MapPin, User } from "lucide-react"

export default async function AccountPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3)

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">My Account</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <User className="mb-2 h-8 w-8 text-primary" />
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Name:</span> {profile?.full_name || "Not set"}
              </p>
              <p>
                <span className="font-medium">Email:</span> {user.email}
              </p>
            </div>
            <Button variant="outline" className="mt-4 w-full bg-transparent" asChild>
              <Link href="/account/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Package className="mb-2 h-8 w-8 text-primary" />
            <CardTitle>Orders</CardTitle>
            <CardDescription>View and track your orders</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders && recentOrders.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground">You have {recentOrders.length} recent orders</p>
                <Button variant="outline" className="mt-4 w-full bg-transparent" asChild>
                  <Link href="/account/orders">View All Orders</Link>
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">No orders yet</p>
                <Button variant="outline" className="mt-4 w-full bg-transparent" asChild>
                  <Link href="/products">Start Shopping</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <MapPin className="mb-2 h-8 w-8 text-primary" />
            <CardTitle>Addresses</CardTitle>
            <CardDescription>Manage your saved addresses</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Save addresses for faster checkout</p>
            <Button variant="outline" className="mt-4 w-full bg-transparent" asChild>
              <Link href="/account/addresses">Manage Addresses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {recentOrders && recentOrders.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-bold">Recent Orders</h2>
          <div className="space-y-4">
            {recentOrders.map((order: any) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Order #{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₺{order.total.toFixed(2)}</p>
                      <p className="text-sm capitalize text-muted-foreground">{order.status}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-4 bg-transparent" asChild>
                    <Link href={`/order/${order.order_number}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
