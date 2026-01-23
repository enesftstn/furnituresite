// app/products/[slug]/page.tsx
import { createClient } from "@/lib/supabase/server"
import type { Product, ProductImage } from "@/lib/types"
import { notFound } from "next/navigation"
import { AddToCartButton } from "./add-to-cart-button"
import { Star, Truck, RotateCcw, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProductCard } from "@/components/product-card"
import { ProductReviews } from "@/components/product-reviews"
import { ProductQA } from "@/components/product-qa"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductImageGallery } from "@/components/product-image-gallery"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// FIXED: Remove Promise wrapper from params
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from("products")
    .select("name, description, price")
    .eq("slug", slug)
    .single()

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

// Loading skeleton component
function ProductSkeleton() {
  return (
    <div className="container py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  )
}

// Reviews section component
async function ReviewsSection({ productId }: { productId: string }) {
  const supabase = await createClient()
  
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      user:users(full_name)
    `)
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(10)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  let canReview = false
  if (user) {
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .maybeSingle()
    
    canReview = !existingReview
  }

  return (
    <ProductReviews
      productId={productId}
      reviews={reviews || []}
      averageRating={0}
      totalReviews={reviews?.length || 0}
      canReview={canReview}
    />
  )
}

// Q&A section component
async function QASection({ productId }: { productId: string }) {
  const supabase = await createClient()
  
  const { data: questions } = await supabase
    .from("product_questions")
    .select(`
      *,
      user:users(full_name),
      answers:product_answers(
        *,
        user:users(full_name, is_admin)
      )
    `)
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(10)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <ProductQA
      productId={productId}
      questions={questions || []}
      isAuthenticated={!!user}
    />
  )
}

// Related products component
async function RelatedProducts({ categoryId, currentProductId }: { categoryId: string; currentProductId: string }) {
  const supabase = await createClient()
  
  const { data: relatedProducts } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      price,
      original_price,
      stock_quantity,
      rating,
      is_new,
      is_featured,
      images:product_images!inner(
        id,
        image_url,
        alt_text,
        is_primary,
        display_order
      )
    `)
    .eq("category_id", categoryId)
    .eq("images.is_primary", true)
    .neq("id", currentProductId)
    .limit(4)

  if (!relatedProducts || relatedProducts.length === 0) {
    return null
  }

  return (
    <div className="mt-16">
      <h2 className="mb-6 text-2xl font-bold">You might also like</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {relatedProducts.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

// FIXED: Remove Promise wrapper from params
export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params
  const supabase = await createClient()

  // Fetch product with optimized query - only get what we need
  const { data: product } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      sku,
      description,
      price,
      original_price,
      category_id,
      dimensions,
      material,
      color,
      stock_quantity,
      is_new,
      rating,
      review_count,
      images:product_images(
        id,
        image_url,
        alt_text,
        display_order,
        is_primary
      ),
      specifications:product_specifications(
        id,
        key,
        value
      )
    `)
    .eq("slug", slug)
    .single()

  if (!product) {
    notFound()
  }

  const hasDiscount = product.original_price && product.original_price > product.price

  return (
    <div className="container py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Images */}
        <ProductImageGallery 
          images={product.images || []} 
          productName={product.name}
          isNew={product.is_new}
          discount={hasDiscount ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100) : 0}
        />

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
            <TabsTrigger value="qa">Q&A</TabsTrigger>
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
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <ReviewsSection productId={product.id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="qa" className="mt-6">
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <QASection productId={product.id} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {product.category_id && (
        <Suspense fallback={<Skeleton className="h-96 w-full mt-16" />}>
          <RelatedProducts categoryId={product.category_id} currentProductId={product.id} />
        </Suspense>
      )}
    </div>
  )
}
