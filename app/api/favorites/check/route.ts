import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ isFavorite: false })
    }

    // Rate limit: 20 requests per minute per user
    if (!checkRateLimit(`favorites:${user.id}`, 20, 60000)) {
      return NextResponse.json(
        { message: "Too many requests" },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("product_id")

    if (!productId) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("favorites")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle()

    if (error) {
      console.error("Favorite check error:", error)
      return NextResponse.json({ isFavorite: false })
    }

    return NextResponse.json({ isFavorite: !!data })
  } catch (error) {
    console.error("Favorite check error:", error)
    return NextResponse.json({ isFavorite: false })
  }
}
