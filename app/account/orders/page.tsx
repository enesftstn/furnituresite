import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function OrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      order_items(*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">My Orders</h1>

      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <p className="text-lg font-semibold">Order #{order.order_number}</p>
                      <Badge variant={order.status === "completed" ? "default" : "secondary"} className="capitalize">
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Placed on{" "}
                      {new Date(order.created_at).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.order_items.length} {order.order_items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <p className="text-2xl font-bold">₺{order.total.toFixed(2)}</p>
                    <Button variant="outline" className="bg-transparent" asChild>
                      <Link href={`/order/${order.order_number}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="mb-4 text-muted-foreground">You haven't placed any orders yet</p>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
