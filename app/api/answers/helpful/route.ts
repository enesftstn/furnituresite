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

    const { answer_id } = await request.json()

    if (!answer_id) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 })
    }

    // Check if already marked as helpful
    const { data: existing } = await supabase
      .from("answer_helpful")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("answer_id", answer_id)
      .single()

    if (existing) {
      // Remove helpful mark
      await supabase
        .from("answer_helpful")
        .delete()
        .eq("user_id", user.id)
        .eq("answer_id", answer_id)
    } else {
      // Add helpful mark
      await supabase.from("answer_helpful").insert({
        user_id: user.id,
        answer_id,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Helpful mark error:", error)
    return NextResponse.json(
      { message: "Failed to update helpful mark" },
      { status: 500 }
    )
  }
}
