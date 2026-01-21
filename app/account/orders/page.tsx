import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, CheckCircle, Clock } from "lucide-react"

const statusIcons = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
}

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
          {orders.map((order: any) => {
            const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Clock
            const statusColor = statusColors[order.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"

            return (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${statusColor}`}>
                        <StatusIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="mb-2 flex items-center gap-3">
                          <p className="text-lg font-semibold">Order #{order.order_number}</p>
                          <Badge className={statusColor + " capitalize"}>
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
                        
                        {/* Tracking Info */}
                        {order.tracking_number && (
                          <p className="mt-2 text-sm font-medium">
                            Tracking: {order.tracking_number}
                          </p>
                        )}
                        {order.estimated_delivery && (
                          <p className="text-sm text-muted-foreground">
                            Est. Delivery: {new Date(order.estimated_delivery).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-3 md:items-end">
                      <p className="text-2xl font-bold">₺{order.total.toFixed(2)}</p>
                      <Button variant="outline" className="bg-transparent" asChild>
                        <Link href={`/order/${order.order_number}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>

                  {/* Order Progress */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      {["pending", "processing", "shipped", "delivered"].map((step, index) => {
                        const isComplete = ["pending", "processing", "shipped", "delivered"].indexOf(order.status) >= index
                        const isCurrent = order.status === step
                        
                        return (
                          <div key={step} className="flex flex-1 flex-col items-center">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                                isComplete
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted bg-background"
                              }`}
                            >
                              {isComplete && <CheckCircle className="h-4 w-4" />}
                            </div>
                            <p className={`mt-2 text-xs capitalize ${isCurrent ? "font-semibold" : "text-muted-foreground"}`}>
                              {step}
                            </p>
                            {index < 3 && (
                              <div
                                className={`absolute h-0.5 w-full ${
                                  isComplete ? "bg-primary" : "bg-muted"
                                }`}
                                style={{
                                  left: "50%",
                                  top: "16px",
                                  width: "calc(100% - 32px)",
                                }}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
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
