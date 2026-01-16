"use client"

import { useCart } from "@/lib/cart"
import { useEffect } from "react"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export function MiniCart() {
  const { items, removeItem, getTotal, getItemCount, cleanInvalidItems } = useCart()
  
  // Clean invalid items on mount
  useEffect(() => {
    cleanInvalidItems()
  }, [cleanInvalidItems])
  
  const total = getTotal()
  const itemCount = getItemCount()
  
  // Filter valid items for display
  const validItems = items.filter((item) => item.product && item.product.id)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {itemCount}
            </Badge>
          )}
          <span className="sr-only">Shopping cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({itemCount})</SheetTitle>
          <SheetDescription>
            {itemCount === 0 ? "Your cart is empty" : "Review your items"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 flex flex-col gap-4">
          {validItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Button asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)] space-y-4">
                {validItems.map((item) => {
                  const primaryImage = item.product.images?.find((img) => img.is_primary)
                  const imageUrl = primaryImage?.image_url || "/placeholder.svg?height=200&width=200"

                  return (
                    <div key={item.product.id} className="flex gap-4 py-4">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <Link 
                            href={`/products/${item.product.slug}`}
                            className="text-sm font-medium hover:underline line-clamp-2"
                          >
                            {item.product.name}
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeItem(item.product.id)}
                          >
                            ×
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold">
                          ₺{(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between text-base font-semibold">
                  <span>Subtotal</span>
                  <span>₺{total.toFixed(2)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Shipping and taxes calculated at checkout
                </p>
                <div className="space-y-2">
                  <Button asChild className="w-full" size="lg">
                    <Link href="/checkout">Checkout</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/cart">View Cart</Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
