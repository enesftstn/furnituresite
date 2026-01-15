import { createClient } from "@/lib/supabase/server"
import type { Product } from "@/lib/types"
import { ProductCard } from "@/components/product-card"

export const metadata = {
  title: "New Arrivals - HOMESTORE",
  description: "Shop the latest furniture arrivals and newest products",
}

export default async function NewArrivalsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      images:product_images(*)
    `)
    .eq("is_new", true)
    .order("created_at", { ascending: false })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">New Arrivals</h1>
        <p className="mt-2 text-muted-foreground">Discover our latest furniture additions</p>
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No new arrivals at the moment. Check back soon!</p>
        </div>
      )}
    </div>
  )
}
