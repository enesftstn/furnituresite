import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle } from "lucide-react"

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      order_items(*)
    `)
    .eq("order_number", orderNumber)
    .single()

  if (!order) {
    notFound()
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-600" />
          <h1 className="mb-2 text-3xl font-bold">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order #{order.order_number}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-2 font-semibold">Order Details</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <span className="font-medium capitalize">{order.status}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Payment:</span>{" "}
                  <span className="font-medium capitalize">{order.payment_method}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Email:</span> {order.guest_email}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="mb-2 font-semibold">Shipping Address</h3>
              <div className="text-sm text-muted-foreground">
                <p>{order.shipping_full_name}</p>
                <p>{order.shipping_address_line1}</p>
                {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
                <p>
                  {order.shipping_city}, {order.shipping_postal_code}
                </p>
                <p>{order.shipping_country}</p>
                <p>{order.shipping_phone}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 font-semibold">Order Items</h3>
              <div className="space-y-2">
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <span className="font-medium">₺{item.total_price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₺{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shipping_cost === 0 ? "Free" : `₺${order.shipping_cost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>₺{order.tax.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₺{order.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
