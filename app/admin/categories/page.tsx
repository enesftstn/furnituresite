import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Categories - Admin Dashboard",
}

export default async function AdminCategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from("categories")
    .select(`
      *,
      parent:categories!parent_id(name)
    `)
    .order("display_order")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage product categories</p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories ({categories?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories && categories.length > 0 ? (
              categories.map((category: any) => (
                <div key={category.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {category.parent?.name ? `Parent: ${category.parent.name}` : "Top Level Category"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">Order: {category.display_order}</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/categories/${category.id}`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No categories found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
