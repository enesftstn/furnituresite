"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Star, ThumbsUp } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Review {
  id: string
  user_id: string
  rating: number
  title: string
  comment: string
  helpful_count: number
  verified_purchase: boolean
  created_at: string
  user: {
    full_name: string
  }
}

interface ProductReviewsProps {
  productId: string
  reviews: Review[]
  averageRating: number
  totalReviews: number
  canReview: boolean
}

export function ProductReviews({ productId, reviews, averageRating, totalReviews, canReview }: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          rating,
          title,
          comment,
        }),
      })

      if (response.ok) {
        setShowReviewForm(false)
        setTitle("")
        setComment("")
        setRating(5)
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to submit review:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleHelpful = async (reviewId: string) => {
    try {
      await fetch("/api/reviews/helpful", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ review_id: reviewId }),
      })
      window.location.reload()
    } catch (error) {
      console.error("Failed to mark review as helpful:", error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-muted-foreground">Based on {totalReviews} reviews</span>
          </div>
        </div>
        {canReview && !showReviewForm && <Button onClick={() => setShowReviewForm(true)}>Write a Review</Button>}
      </div>

      {showReviewForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Write Your Review</h3>

          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                  <Star className={`h-8 w-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sum up your experience"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Review</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you think"
              rows={4}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowReviewForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="space-y-3 rounded-lg border p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback>{review.user?.full_name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{review.user?.full_name || "Anonymous"}</span>
                    {review.verified_purchase && (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">Verified Purchase</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {review.title && <h4 className="font-semibold">{review.title}</h4>}
            <p className="text-muted-foreground">{review.comment}</p>

            <button
              onClick={() => handleHelpful(review.id)}
              className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <ThumbsUp className="h-4 w-4" />
              Helpful ({review.helpful_count})
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
