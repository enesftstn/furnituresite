import { createClient } from "@/lib/supabase/server"
import type { Product, ProductImage } from "@/lib/types"
import { notFound } from "next/navigation"
import Image from "next/image"
import { AddToCartButton } from "./add-to-cart-button"
import { Star, Truck, RotateCcw, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProductCard } from "@/components/product-card"
import { ProductReviews } from "@/components/product-reviews"
import { ProductQA } from "@/components/product-qa"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase.from("products").select("name, description, price").eq("slug", slug).single()

  if (!product) {
    return {
      title: "Product Not Found",
    }
  }

  return {
    title: `${product.name} - HOMESTORE`,
    description: product.description || `Buy ${product.name} for ₺${product.price}`,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(*),
      images:product_images(*),
      variants:product_variants(*),
      specifications:product_specifications(*)
    `)
    .eq("slug", slug)
    .single()

  if (!product) {
    notFound()
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      user:users(full_name)
    `)
    .eq("product_id", product.id)
    .order("created_at", { ascending: false })

  // Fetch Q&A data
  const { data: questions } = await supabase
    .from("product_questions")
    .select(`
      *,
      user:users(full_name),
      answers:product_answers(
        *,
        user:users(full_name)
      )
    `)
    .eq("product_id", product.id)
    .order("created_at", { ascending: false })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  let canReview = false
  if (user) {
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("product_id", product.id)
      .eq("user_id", user.id)
      .maybeSingle()
    
    canReview = !existingReview
  }

  // Fetch related products - only if category exists
  let relatedProducts = null
  if (product.category_id) {
    const { data } = await supabase
      .from("products")
      .select(`
        *,
        images:product_images(*)
      `)
      .eq("category_id", product.category_id)
      .neq("id", product.id)
      .limit(4)
    
    relatedProducts = data
  }

  const sortedImages = (product.images as ProductImage[])?.sort((a, b) => a.display_order - b.display_order)
  const primaryImage = sortedImages?.[0]

  const hasDiscount = product.original_price && product.original_price > product.price

  return (
    <div className="container py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image
              src={primaryImage?.image_url || "/placeholder.svg?height=600&width=600&query=furniture"}
              alt={product.name}
              fill
              className="object-cover"
              priority
              unoptimized
            />
            {product.is_new && <Badge className="absolute left-4 top-4 bg-primary">New</Badge>}
            {hasDiscount && (
              <Badge className="absolute right-4 top-4 bg-destructive">
                {Math.round(((product.original_price! - product.price) / product.original_price!) * 100)}% OFF
              </Badge>
            )}
          </div>
          {sortedImages && sortedImages.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {sortedImages.slice(1, 5).map((image: ProductImage) => (
                <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={image.image_url || "/placeholder.svg"}
                    alt={image.alt_text || product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-balance">{product.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">SKU: {product.sku}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{product.rating}</span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm text-muted-foreground">{product.review_count} reviews</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold">₺{product.price.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-xl text-muted-foreground line-through">
                  ₺{product.original_price!.toFixed(2)}
                </span>
              )}
            </div>
            {product.stock_quantity === 0 ? (
              <p className="text-destructive">Out of stock</p>
            ) : product.stock_quantity < 10 ? (
              <p className="text-orange-600">Only {product.stock_quantity} left in stock</p>
            ) : (
              <p className="text-green-600">In stock</p>
            )}
          </div>

          <Separator />

          <AddToCartButton product={product} />

          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Free Delivery</p>
                <p className="text-sm text-muted-foreground">On orders over ₺2,000</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Easy Returns</p>
                <p className="text-sm text-muted-foreground">365-day return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Secure Payment</p>
                <p className="text-sm text-muted-foreground">100% secure transactions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.review_count})</TabsTrigger>
            <TabsTrigger value="qa">Q&A ({questions?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6 space-y-4">
            <h3 className="text-xl font-semibold">Product Description</h3>
            <p className="text-muted-foreground text-pretty">{product.description}</p>

            {(product.dimensions || product.material || product.color) && (
              <div className="space-y-2">
                <h4 className="font-semibold">Quick Details</h4>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {product.dimensions && (
                    <>
                      <dt className="text-muted-foreground">Dimensions:</dt>
                      <dd>{product.dimensions}</dd>
                    </>
                  )}
                  {product.material && (
                    <>
                      <dt className="text-muted-foreground">Material:</dt>
                      <dd>{product.material}</dd>
                    </>
                  )}
                  {product.color && (
                    <>
                      <dt className="text-muted-foreground">Color:</dt>
                      <dd>{product.color}</dd>
                    </>
                  )}
                </dl>
              </div>
            )}
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            {product.specifications && product.specifications.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Technical Specifications</h3>
                <dl className="grid grid-cols-1 gap-2 border-t">
                  {product.specifications.map((spec: any) => (
                    <div key={spec.id} className="grid grid-cols-2 gap-4 border-b py-3">
                      <dt className="font-medium text-muted-foreground">{spec.key}</dt>
                      <dd>{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : (
              <p className="text-muted-foreground">No specifications available for this product.</p>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <ProductReviews
              productId={product.id}
              reviews={reviews || []}
              averageRating={product.rating}
              totalReviews={product.review_count}
              canReview={canReview}
            />
          </TabsContent>

          <TabsContent value="qa" className="mt-6">
            <ProductQA
              productId={product.id}
              questions={questions || []}
              isAuthenticated={!!user}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">You might also like</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct: Product) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}