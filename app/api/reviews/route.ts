import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { product_id, rating, title, comment } = await request.json()

    if (!product_id || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 })
    }

    // Check if user has purchased this product
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("id, order:orders!inner(user_id)")
      .eq("product_id", product_id)
      .eq("order.user_id", user.id)
      .limit(1)

    const verifiedPurchase = orderItems && orderItems.length > 0

    // Insert review
    const { data: review, error } = await supabase
      .from("reviews")
      .insert({
        user_id: user.id,
        product_id,
        rating,
        title,
        comment,
        verified_purchase: verifiedPurchase,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ message: "You have already reviewed this product" }, { status: 400 })
      }
      throw error
    }

    // Update product rating and review count
    const { data: reviews } = await supabase.from("reviews").select("rating").eq("product_id", product_id)

    if (reviews) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      await supabase
        .from("products")
        .update({
          rating: avgRating,
          review_count: reviews.length,
        })
        .eq("id", product_id)
    }

    return NextResponse.json({ review })
  } catch (error) {
    console.error("Review submission error:", error)
    return NextResponse.json({ message: "Failed to submit review" }, { status: 500 })
  }
}
