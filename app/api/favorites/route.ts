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

    const { product_id } = await request.json()

    if (!product_id) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 })
    }

    const { error } = await supabase.from("favorites").insert({
      user_id: user.id,
      product_id,
    })

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ message: "Already in wishlist" }, { status: 400 })
      }
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Add to favorites error:", error)
    return NextResponse.json({ message: "Failed to add to wishlist" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { product_id } = await request.json()

    if (!product_id) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 })
    }

    const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", product_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Remove from favorites error:", error)
    return NextResponse.json({ message: "Failed to remove from wishlist" }, { status: 500 })
  }
}
