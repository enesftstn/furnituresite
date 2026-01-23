"use client"

import { type Product } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cart"
import { useFavorites } from "@/contexts/favorites-context"
import { useEffect, useState } from "react"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem)
  const { favorites, toggleFavorite, isLoading } = useFavorites()
  const [mounted, setMounted] = useState(false)

  // Only render interactive elements after mount to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  const primaryImage = product.images?.find((img) => img.is_primary)
  const imageUrl = primaryImage?.image_url || "/placeholder.svg?height=400&width=400"
  
  const hasDiscount = product.original_price && product.original_price > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0

  const isFavorite = mounted ? favorites.has(product.id) : false

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!mounted) return
    
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

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!mounted) return
    toggleFavorite(product.id)
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
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="lazy"
          />
          
          <div className="absolute left-2 top-2 flex flex-col gap-2">
            {product.is_new && <Badge className="bg-primary">New</Badge>}
            {hasDiscount && (
              <Badge className="bg-destructive">{discountPercent}% OFF</Badge>
            )}
          </div>

          {/* Only render favorite button after mount */}
          {mounted && !isLoading && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={handleToggleFavorite}
              type="button"
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
          disabled={product.stock_quantity === 0 || !mounted}
          type="button"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  )
}
