import { createClient } from "@/lib/supabase/server"
import type { Product } from "@/lib/types"
import { ProductCard } from "@/components/product-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Products - Admin Dashboard",
}

export default async function AdminProductsPage({
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

  let query = supabase
    .from("products")
    .select(`
      *,
      images:product_images(*),
      category:categories(name, slug)
    `)

  // Category filter - only apply if not "all"
  if (params.category && params.category !== "all") {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.category)
      .single()
    
    if (category) {
      query = query.eq("category_id", category.id)
    }
  }

  // Price filters
  if (params.minPrice) {
    query = query.gte("price", parseFloat(params.minPrice))
  }
  if (params.maxPrice) {
    query = query.lte("price", parseFloat(params.maxPrice))
  }

  // Color filter - only apply if not "all"
  if (params.color && params.color !== "all") {
    query = query.ilike("color", `%${params.color}%`)
  }

  // Material filter - only apply if not "all"
  if (params.material && params.material !== "all") {
    query = query.ilike("material", `%${params.material}%`)
  }

  // Stock filter
  if (params.inStock === "true") {
    query = query.gt("stock_quantity", 0)
  }

  // Sorting
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

  const { data: products } = await query

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products ({products?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product: Product) => (
                <div key={product.id} className="space-y-2">
                  <ProductCard product={product} />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                      <Link href={`/admin/products/${product.id}`}>Edit</Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                      <Link href={`/products/${product.slug}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No products found</p>
              <Button className="mt-4" asChild>
                <Link href="/admin/products/new">Add Your First Product</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
