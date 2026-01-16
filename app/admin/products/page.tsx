import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import { Plus, Search } from "lucide-react"

export const metadata = {
  title: "Products - Admin Dashboard",
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("products")
    .select(`
      *,
      category:categories(name),
      images:product_images(*)
    `)
    .order("created_at", { ascending: false })

  if (search) {
    query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
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
          <div className="flex items-center justify-between">
            <CardTitle>All Products ({products?.length || 0})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <form action="/admin/products" method="get">
                <Input
                  name="search"
                  placeholder="Search products..."
                  defaultValue={search}
                  className="pl-8"
                />
              </form>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products && products.length > 0 ? (
              products.map((product: any) => {
                const primaryImage = product.images?.find((img: any) => img.is_primary)
                return (
                  <div key={product.id} className="flex items-center gap-4 border-b pb-4 last:border-0">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={primaryImage?.image_url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        {product.is_new && <Badge>New</Badge>}
                        {product.is_featured && <Badge variant="secondary">Featured</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{product.category?.name || "Uncategorized"}</p>
                      <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">₺{product.price}</p>
                        <p className="text-sm text-muted-foreground">Stock: {product.stock_quantity}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/products/${product.id}`}>Edit</Link>
                      </Button>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {search ? `No products found for "${search}"` : "No products found"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
