"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

interface ProductFiltersProps {
  categories: Array<{ name: string; slug: string }>
  colors: string[]
  materials: string[]
  currentFilters: any
}

export function ProductFilters({
  categories,
  colors,
  materials,
  currentFilters,
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/products?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/products")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sort By */}
        <div className="space-y-2">
          <Label>Sort By</Label>
          <Select
            value={currentFilters.sortBy || "newest"}
            onValueChange={(value) => updateFilter("sortBy", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sorting" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={currentFilters.category || ""}
            onValueChange={(value) => updateFilter("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.slug} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Price Range */}
        <div className="space-y-3">
          <Label>Price Range (₺)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={currentFilters.minPrice || ""}
              onChange={(e) => updateFilter("minPrice", e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={currentFilters.maxPrice || ""}
              onChange={(e) => updateFilter("maxPrice", e.target.value)}
            />
          </div>
        </div>

        <Separator />

        {/* Color */}
        {colors.length > 0 && (
          <>
            <div className="space-y-2">
              <Label>Color</Label>
              <Select
                value={currentFilters.color || ""}
                onValueChange={(value) => updateFilter("color", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Color</SelectItem>
                  {colors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator />
          </>
        )}

        {/* Material */}
        {materials.length > 0 && (
          <>
            <div className="space-y-2">
              <Label>Material</Label>
              <Select
                value={currentFilters.material || ""}
                onValueChange={(value) => updateFilter("material", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Material</SelectItem>
                  {materials.map((material) => (
                    <SelectItem key={material} value={material}>
                      {material}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator />
          </>
        )}

        {/* In Stock */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="inStock"
            checked={currentFilters.inStock === "true"}
            onCheckedChange={(checked) =>
              updateFilter("inStock", checked ? "true" : "")
            }
          />
          <Label htmlFor="inStock" className="cursor-pointer">
            In Stock Only
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}