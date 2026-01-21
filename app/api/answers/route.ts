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

    const { question_id, answer } = await request.json()

    if (!question_id || !answer) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 })
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    const { data: newAnswer, error } = await supabase
      .from("product_answers")
      .insert({
        question_id,
        answer: answer.trim(),
        user_id: user.id,
        is_official: userData?.is_admin || false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ answer: newAnswer })
  } catch (error) {
    console.error("Answer submission error:", error)
    return NextResponse.json(
      { message: "Failed to submit answer" },
      { status: 500 }
    )
  }
}