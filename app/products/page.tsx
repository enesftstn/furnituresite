import { createClient } from "@/lib/supabase/server"
import type { Product } from "@/lib/types"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"

export const metadata = {
  title: "All Products - HOMESTORE",
  description: "Browse our complete collection of furniture and home accessories",
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string
    minPrice?: string
    maxPrice?: string
    color?: string
    material?: string
    inStock?: string
    sortBy?: string
  }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // OPTIMIZED: Build query step by step
  let query = supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      price,
      original_price,
      stock_quantity,
      is_new,
      sku,
      rating,
      review_count,
      color,
      material,
      category_id,
      images:product_images!inner(
        image_url,
        alt_text,
        is_primary
      )
    `)
    .eq("product_images.is_primary", true)

  // Category filter - OPTIMIZED: Uses composite index
  if (params.category) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.category)
      .single()
    
    if (category) {
      query = query.eq("category_id", category.id)
    }
  }

  // Price filters - OPTIMIZED: Uses price index
  if (params.minPrice) {
    query = query.gte("price", parseFloat(params.minPrice))
  }
  if (params.maxPrice) {
    query = query.lte("price", parseFloat(params.maxPrice))
  }

  // Color filter
  if (params.color) {
    query = query.ilike("color", `%${params.color}%`)
  }

  // Material filter
  if (params.material) {
    query = query.ilike("material", `%${params.material}%`)
  }

  // Stock filter - OPTIMIZED: Uses stock index
  if (params.inStock === "true") {
    query = query.gt("stock_quantity", 0)
  }

  // Sorting - OPTIMIZED: Uses appropriate indexes
  switch (params.sortBy) {
    case "price-asc":
      query = query.order("price", { ascending: true })
      break
    case "price-desc":
      query = query.order("price", { ascending: false })
      break
    case "name-asc":
      query = query.order("name", { ascending: true })
      break
    case "rating":
      query = query.order("rating", { ascending: false })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  // OPTIMIZED: Limit results to first 50
  query = query.range(0, 49)

  const { data: products } = await query

  // OPTIMIZED: Get unique colors and materials efficiently
  const { data: allProducts } = await supabase
    .from("products")
    .select("color, material")
    .not("color", "is", null)
    .not("material", "is", null)
    .limit(1000)

  const colors = [...new Set(allProducts?.map(p => p.color).filter(Boolean))]
  const materials = [...new Set(allProducts?.map(p => p.material).filter(Boolean))]

  // OPTIMIZED: Only fetch category names, not full data
  const { data: categories } = await supabase
    .from("categories")
    .select("name, slug")
    .is("parent_id", null)
    .order("name")

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">All Products</h1>
        <p className="mt-2 text-muted-foreground">
          {products?.length || 0} products found
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <ProductFilters
            categories={categories || []}
            colors={colors}
            materials={materials}
            currentFilters={params}
          />
        </aside>

        <div className="lg:col-span-3">
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No products found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
