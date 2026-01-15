import { createClient } from "@/lib/supabase/server"
import type { Product, Category } from "@/lib/types"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { HeroSlider } from "@/components/hero-slider"
import { Newsletter } from "@/components/newsletter"

export const metadata = {
  title: "HOMESTORE - Affordable Furniture for Modern Living",
  description:
    "Discover stylish and affordable furniture for every room in your home. Shop beds, sofas, storage solutions, and more.",
}

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch featured products
  const { data: featuredProducts } = await supabase
    .from("products")
    .select(`
      *,
      images:product_images(*)
    `)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(8)

  // Fetch new arrivals
  const { data: newProducts } = await supabase
    .from("products")
    .select(`
      *,
      images:product_images(*)
    `)
    .eq("is_new", true)
    .order("created_at", { ascending: false })
    .limit(4)

  // Fetch main categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .is("parent_id", null)
    .order("display_order")
    .limit(4)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <HeroSlider />

      {/* Categories Section */}
      <section className="py-12">
        <div className="container">
          <h2 className="mb-8 text-3xl font-bold">Shop by Category</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {categories?.map((category: Category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
              >
                <Image
                  src={category.image_url || "/placeholder.svg?height=400&width=400&query=furniture"}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-semibold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">Explore collection</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-muted/50 py-12">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Button variant="outline" asChild>
              <Link href="/products">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts?.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newProducts && newProducts.length > 0 && (
        <section className="py-12">
          <div className="container">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold">New Arrivals</h2>
              <Button variant="outline" asChild>
                <Link href="/new">View All</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {newProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <Newsletter />

      {/* Benefits Section */}
      <section className="border-t bg-muted/50 py-12">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold">Free Delivery</h3>
              <p className="text-sm text-muted-foreground">On orders over ₺2,000</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold">Secure Payment</h3>
              <p className="text-sm text-muted-foreground">100% secure transactions</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold">Easy Returns</h3>
              <p className="text-sm text-muted-foreground">365-day return policy</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
