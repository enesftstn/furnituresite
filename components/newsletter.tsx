"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage("Thank you for subscribing!")
        setEmail("")
      } else {
        setStatus("error")
        setMessage(data.message || "Something went wrong. Please try again.")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Something went wrong. Please try again.")
    }

    setTimeout(() => {
      setStatus("idle")
      setMessage("")
    }, 5000)
  }

  return (
    <section className="border-t bg-primary py-16 text-primary-foreground">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <Mail className="mx-auto mb-4 h-12 w-12" />
          <h2 className="mb-2 text-3xl font-bold">Join Our Newsletter</h2>
          <p className="mb-6 text-primary-foreground/80">
            Subscribe to get special offers, free giveaways, and exclusive deals.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background text-foreground"
              disabled={status === "loading"}
            />
            <Button type="submit" variant="secondary" className="whitespace-nowrap" disabled={status === "loading"}>
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
          {message && (
            <p className={`mt-4 text-sm ${status === "success" ? "text-primary-foreground" : "text-destructive"}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
