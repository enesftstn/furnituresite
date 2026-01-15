import { createClient } from "@/lib/supabase/server"
import type { Product } from "@/lib/types"
import { ProductCard } from "@/components/product-card"

export const metadata = {
  title: "Deals & Discounts - HOMESTORE",
  description: "Shop our best deals and discounted furniture",
}

export default async function DealsPage() {
  const supabase = await createClient()

  // Fetch products with discounts
  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      images:product_images(*)
    `)
    .not("original_price", "is", null)
    .order("created_at", { ascending: false })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Deals & Discounts</h1>
        <p className="mt-2 text-muted-foreground">Shop our best deals and save on quality furniture</p>
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No deals available at the moment. Check back soon!</p>
        </div>
      )}
    </div>
  )
}
