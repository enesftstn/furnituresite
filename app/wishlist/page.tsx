import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/types"

export const metadata = {
  title: "Wishlist - HOMESTORE",
  description: "Your saved items",
}

export default async function WishlistPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: favorites } = await supabase
    .from("favorites")
    .select(`
      product_id,
      product:products(
        *,
        images:product_images(*)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const products = favorites?.map((fav: any) => fav.product).filter(Boolean) || []

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <p className="mt-2 text-muted-foreground">
          {products.length > 0 ? `${products.length} items saved` : "No items saved yet"}
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="mb-4 text-muted-foreground">Your wishlist is empty</p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
