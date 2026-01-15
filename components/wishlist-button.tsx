"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface WishlistButtonProps {
  productId: string
  variant?: "default" | "ghost" | "icon"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function WishlistButton({ productId, variant = "ghost", size = "icon", className }: WishlistButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkFavoriteStatus()
  }, [productId])

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/favorites/check?product_id=${productId}`)
      if (response.ok) {
        const data = await response.json()
        setIsFavorite(data.isFavorite)
      }
    } catch (error) {
      console.error("Failed to check favorite status:", error)
    }
  }

  const toggleFavorite = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/favorites", {
        method: isFavorite ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_id: productId }),
      })

      if (response.status === 401) {
        router.push("/login")
        return
      }

      if (response.ok) {
        setIsFavorite(!isFavorite)
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleFavorite}
      disabled={isLoading}
      className={className}
      aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
    </Button>
  )
}
