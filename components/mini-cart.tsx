"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ShoppingCart, X } from "lucide-react"
import { useCart } from "@/lib/cart"
import Image from "next/image"
import Link from "next/link"

export function MiniCart() {
  const { items, removeItem, updateQuantity, getCartTotal } = useCart()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {items.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {items.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({items.length})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-auto py-4">
              {items.map((item) => (
                <div key={`${item.id}-${item.variantId || "default"}`} className="flex gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <div>
                        <Link href={`/products/${item.slug}`} className="font-medium hover:underline">
                          {item.name}
                        </Link>
                        {item.variantName && <p className="text-sm text-muted-foreground">{item.variantName}</p>}
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.variantId)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0 bg-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </Button>
                        <span className="text-sm">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0 bg-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId)}
                        >
                          +
                        </Button>
                      </div>
                      <span className="font-semibold">₺{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal</span>
                <span>₺{getCartTotal().toFixed(2)}</span>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link href="/cart">View Cart</Link>
              </Button>
              <Button asChild className="w-full bg-transparent" size="lg" variant="outline">
                <Link href="/checkout">Checkout</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
