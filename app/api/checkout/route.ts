import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, shipping, totals } = body

    const supabase = await createClient()

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        guest_email: shipping.email,
        shipping_full_name: shipping.fullName,
        shipping_address_line1: shipping.addressLine1,
        shipping_address_line2: shipping.addressLine2 || null,
        shipping_city: shipping.city,
        shipping_postal_code: shipping.postalCode,
        shipping_country: "Turkey",
        shipping_phone: shipping.phone,
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping_cost: totals.shipping,
        total: totals.total,
        payment_method: shipping.paymentMethod,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error("[v0] Order creation error:", orderError)
      return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 })
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_sku: item.product_sku,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("[v0] Order items error:", itemsError)
      return NextResponse.json({ success: false, error: "Failed to create order items" }, { status: 500 })
    }

    // If payment method is card, create Stripe checkout session
    if (shipping.paymentMethod === "card") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: items.map((item: any) => ({
          price_data: {
            currency: "try",
            product_data: {
              name: item.product_name,
            },
            unit_amount: Math.round(item.unit_price * 100), // Convert to cents
          },
          quantity: item.quantity,
        })),
        mode: "payment",
        success_url: `${request.headers.get("origin")}/order/${orderNumber}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${request.headers.get("origin")}/checkout`,
        metadata: {
          order_id: order.id,
          order_number: orderNumber,
        },
      })

      // Update order with Stripe session ID
      await supabase.from("orders").update({ stripe_payment_intent_id: session.id }).eq("id", order.id)

      return NextResponse.json({
        success: true,
        orderNumber,
        checkoutUrl: session.url,
      })
    }

    // For cash on delivery, just return success
    return NextResponse.json({
      success: true,
      orderNumber,
    })
  } catch (error) {
    console.error("[v0] Checkout error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
