import { createClient } from "@/lib/supabase/server"
import type { Product } from "@/lib/types"
import { ProductCard } from "@/components/product-card"

export const metadata = {
  title: "Search - HOMESTORE",
  description: "Search for products",
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q || ""

  const supabase = await createClient()

  let products: Product[] = []

  if (query) {
    const { data } = await supabase
      .from("products")
      .select(`
        *,
        images:product_images(*)
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order("created_at", { ascending: false })

    products = data || []
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Search Results</h1>
        {query && (
          <p className="mt-2 text-muted-foreground">
            {products.length} {products.length === 1 ? "result" : "results"} for "{query}"
          </p>
        )}
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            {query ? "No products found. Try a different search term." : "Enter a search term to find products."}
          </p>
        </div>
      )}
    </div>
  )
}
