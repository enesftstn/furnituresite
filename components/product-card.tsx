"use client"

import type { Product } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cart"
import { useState, useEffect, useCallback } from "react"

interface ProductCardProps {
  product: Product
}

// Cache to prevent repeated API calls
const favoriteCache = new Map<string, boolean>()

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isCheckingFavorite, setIsCheckingFavorite] = useState(true)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)

  const primaryImage = product.images?.find((img) => img.is_primary)
  const imageUrl = primaryImage?.image_url || "/placeholder.svg?height=400&width=400"
  
  const hasDiscount = product.original_price && product.original_price > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0

  // Check if product is favorited with caching
  useEffect(() => {
    const checkFavorite = async () => {
      // Check cache first
      if (favoriteCache.has(product.id)) {
        setIsFavorite(favoriteCache.get(product.id)!)
        setIsCheckingFavorite(false)
        return
      }

      try {
        const res = await fetch(`/api/favorites/check?product_id=${product.id}`, {
          cache: 'no-store'
        })
        
        if (res.status === 429) {
          // Rate limited, just hide the button
          console.warn('Rate limited on favorites check')
          setIsCheckingFavorite(false)
          return
        }

        if (res.ok) {
          const data = await res.json()
          setIsFavorite(data.isFavorite)
          favoriteCache.set(product.id, data.isFavorite)
        }
      } catch (error) {
        console.error('Failed to check favorite:', error)
      } finally {
        setIsCheckingFavorite(false)
      }
    }
    
    // Add small delay to prevent all cards checking at once
    const timeout = setTimeout(checkFavorite, Math.random() * 100)
    return () => clearTimeout(timeout)
  }, [product.id])

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: imageUrl,
        stock_quantity: product.stock_quantity,
        sku: product.sku,
        images: product.images,
      },
      1
    )
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isTogglingFavorite) return

    setIsTogglingFavorite(true)

    try {
      if (isFavorite) {
        // Remove from favorites
        const res = await fetch('/api/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: product.id }),
        })
        if (res.ok) {
          setIsFavorite(false)
          favoriteCache.set(product.id, false)
        }
      } else {
        // Add to favorites
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: product.id }),
        })
        if (res.ok) {
          setIsFavorite(true)
          favoriteCache.set(product.id, true)
        } else if (res.status === 401) {
          // Not logged in - redirect to login
          window.location.href = '/login'
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  return (
    <Card className="group overflow-hidden">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            unoptimized
          />
          
          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-2">
            {product.is_new && <Badge className="bg-primary">New</Badge>}
            {hasDiscount && (
              <Badge className="bg-destructive">{discountPercent}% OFF</Badge>
            )}
          </div>

          {/* Favorite Button - only show when loaded */}
          {!isCheckingFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={handleToggleFavorite}
              disabled={isTogglingFavorite}
            >
              <Heart
                className={`h-4 w-4 ${
                  isFavorite ? "fill-red-500 text-red-500" : "text-foreground"
                }`}
              />
            </Button>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="line-clamp-2 font-semibold">{product.name}</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold">₺{product.price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ₺{product.original_price!.toFixed(2)}
              </span>
            )}
          </div>
          
          {product.stock_quantity === 0 ? (
            <p className="mt-1 text-sm text-destructive">Out of stock</p>
          ) : product.stock_quantity < 10 ? (
            <p className="mt-1 text-sm text-orange-600">Only {product.stock_quantity} left</p>
          ) : null}
        </CardContent>
      </Link>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={product.stock_quantity === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  )
}
