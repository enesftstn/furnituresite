import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ message: "Invalid email address" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if email already exists
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, unsubscribed_at")
      .eq("email", email)
      .single()

    if (existing && !existing.unsubscribed_at) {
      return NextResponse.json({ message: "You are already subscribed!" }, { status: 400 })
    }

    if (existing && existing.unsubscribed_at) {
      // Resubscribe
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ unsubscribed_at: null, subscribed_at: new Date().toISOString() })
        .eq("email", email)

      if (error) throw error
    } else {
      // New subscription
      const { error } = await supabase.from("newsletter_subscribers").insert({ email })

      if (error) throw error
    }

    return NextResponse.json({ message: "Successfully subscribed!" })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json({ message: "Failed to subscribe. Please try again." }, { status: 500 })
  }
}
