import { createClient } from "@/lib/supabase/server"
import type { Product, Category } from "@/lib/types"
import { ProductCard } from "@/components/product-card"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase.from("categories").select("name, description").eq("slug", slug).single()

  if (!category) {
    return {
      title: "Category Not Found",
    }
  }

  return {
    title: `${category.name} - HOMESTORE`,
    description: category.description || `Shop ${category.name}`,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase.from("categories").select("*").eq("slug", slug).single()

  if (!category) {
    notFound()
  }

  // Fetch subcategories
  const { data: subcategories } = await supabase
    .from("categories")
    .select("*")
    .eq("parent_id", category.id)
    .order("display_order")

  // Fetch products in this category
  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      images:product_images(*)
    `)
    .eq("category_id", category.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/categories" className="hover:text-foreground">
          Categories
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{category.name}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold">{category.name}</h1>
        {category.description && <p className="mt-2 text-muted-foreground">{category.description}</p>}
      </div>

      {/* Subcategories */}
      {subcategories && subcategories.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Subcategories</h2>
          <div className="flex flex-wrap gap-3">
            {subcategories.map((subcat: Category) => (
              <Link
                key={subcat.id}
                href={`/categories/${subcat.slug}`}
                className="rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
              >
                {subcat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No products found in this category.</p>
        </div>
      )}
    </div>
  )
}
