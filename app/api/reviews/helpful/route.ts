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

    const { review_id } = await request.json()

    if (!review_id) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 })
    }

    // Check if already voted
    const { data: existing } = await supabase
      .from("review_helpful")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("review_id", review_id)
      .single()

    if (existing) {
      // Remove vote
      await supabase.from("review_helpful").delete().eq("user_id", user.id).eq("review_id", review_id)
    } else {
      // Add vote
      await supabase.from("review_helpful").insert({
        user_id: user.id,
        review_id,
      })
    }

    // Update helpful count
    const { data: votes } = await supabase.from("review_helpful").select("user_id").eq("review_id", review_id)

    await supabase
      .from("reviews")
      .update({ helpful_count: votes?.length || 0 })
      .eq("id", review_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Review helpful vote error:", error)
    return NextResponse.json({ message: "Failed to update vote" }, { status: 500 })
  }
}
