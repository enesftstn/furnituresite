import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { product_id, question, guest_name, guest_email } = await request.json()

    if (!product_id || !question) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 })
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Prepare question data
    const questionData: any = {
      product_id,
      question: question.trim(),
    }

    if (user) {
      questionData.user_id = user.id
    } else {
      if (!guest_name || !guest_email) {
        return NextResponse.json(
          { message: "Guest name and email required" },
          { status: 400 }
        )
      }
      questionData.guest_name = guest_name.trim()
      questionData.guest_email = guest_email.trim()
    }

    const { data: newQuestion, error } = await supabase
      .from("product_questions")
      .insert(questionData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ question: newQuestion })
  } catch (error) {
    console.error("Question submission error:", error)
    return NextResponse.json(
      { message: "Failed to submit question" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("product_id")

    if (!productId) {
      return NextResponse.json({ message: "Product ID required" }, { status: 400 })
    }

    const { data: questions, error } = await supabase
      .from("product_questions")
      .select(`
        *,
        user:users(full_name),
        answers:product_answers(
          *,
          user:users(full_name, is_admin)
        )
      `)
      .eq("product_id", productId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Questions fetch error:", error)
    return NextResponse.json(
      { message: "Failed to fetch questions" },
      { status: 500 }
    )
  }
}