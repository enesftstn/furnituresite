import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { WishlistButton } from "@/components/wishlist-button"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.is_primary)
  const imageUrl = primaryImage?.image_url || "/assorted-living-room-furniture.png"
  const hasDiscount = product.original_price && product.original_price > product.price

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg relative">
      <div className="absolute right-2 top-2 z-10">
        <WishlistButton
          productId={product.id}
          variant="ghost"
          size="icon"
          className="bg-background/80 hover:bg-background"
        />
      </div>

      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {product.is_new && <Badge className="absolute left-2 top-2 bg-primary">New</Badge>}
          {hasDiscount && (
            <Badge className="absolute left-2 top-12 bg-destructive">
              {Math.round(((product.original_price! - product.price) / product.original_price!) * 100)}% OFF
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-2 mb-2">{product.name}</h3>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">({product.review_count})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">₺{product.price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">₺{product.original_price!.toFixed(2)}</span>
            )}
          </div>
          {product.stock_quantity === 0 ? (
            <p className="mt-2 text-sm text-destructive">Out of stock</p>
          ) : product.stock_quantity < 10 ? (
            <p className="mt-2 text-sm text-orange-600">Only {product.stock_quantity} left</p>
          ) : null}
        </CardContent>
      </Link>
    </Card>
  )
}
