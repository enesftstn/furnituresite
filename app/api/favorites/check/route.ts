import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ isFavorite: false })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("product_id")

    if (!productId) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 })
    }

    const { data } = await supabase
      .from("favorites")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single()

    return NextResponse.json({ isFavorite: !!data })
  } catch (error) {
    return NextResponse.json({ isFavorite: false })
  }
}
