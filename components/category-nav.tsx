import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import type { Category } from "@/lib/types"

export async function CategoryNav() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .is("parent_id", null)
    .order("display_order")

  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <div className="border-b bg-muted/50">
      <div className="container">
        <nav className="flex items-center gap-6 overflow-x-auto py-3">
          {categories.map((category: Category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="whitespace-nowrap text-sm font-medium transition-colors hover:text-primary"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
