import { createClient } from "@/lib/supabase/server"
import type { Category } from "@/lib/types"
import Link from "next/link"
import Image from "next/image"

export const metadata = {
  title: "Categories - HOMESTORE",
  description: "Browse all furniture categories including sofas, beds, storage, kitchen, and more",
}

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .is("parent_id", null)
    .order("display_order")

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Shop by Category</h1>
        <p className="mt-2 text-muted-foreground">Browse our complete range of furniture categories</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {categories?.map((category: Category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group relative aspect-square overflow-hidden rounded-lg bg-muted transition-transform hover:scale-105"
          >
            <Image
              src={category.image_url || "/placeholder.svg?height=400&width=400&query=furniture"}
              alt={category.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="text-2xl font-bold">{category.name}</h3>
              {category.description && <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
