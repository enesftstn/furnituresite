"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart"
import type { Product } from "@/lib/types"
import { ShoppingCart, Check } from "lucide-react"
import { useState } from "react"

interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCart((state) => state.addItem)
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    const primaryImage = product.images?.find((img) => img.is_primary)
    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: primaryImage?.image_url || null,
        stock_quantity: product.stock_quantity,
      },
      1,
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (product.stock_quantity === 0) {
    return (
      <Button size="lg" className="w-full" disabled>
        Out of Stock
      </Button>
    )
  }

  return (
    <Button size="lg" className="w-full" onClick={handleAddToCart}>
      {added ? (
        <>
          <Check className="mr-2 h-5 w-5" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-5 w-5" />
          Add to Cart
        </>
      )}
    </Button>
  )
}
