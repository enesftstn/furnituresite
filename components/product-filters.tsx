"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

interface ProductFiltersProps {
  categories: Array<{ name: string; slug: string }>
  colors: string[]
  materials: string[]
  currentFilters: {
    category?: string
    minPrice?: string
    maxPrice?: string
    color?: string
    material?: string
    inStock?: string
    sortBy?: string
  }
}

export function ProductFilters({
  categories,
  colors,
  materials,
  currentFilters,
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [localFilters, setLocalFilters] = useState(currentFilters)

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value && value !== "all") {
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
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={currentFilters.category || "all"}
            onValueChange={(value) => updateFilter("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.slug} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label>Price Range</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={localFilters.minPrice || ""}
              onChange={(e) => {
                setLocalFilters({ ...localFilters, minPrice: e.target.value })
              }}
              onBlur={(e) => updateFilter("minPrice", e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={localFilters.maxPrice || ""}
              onChange={(e) => {
                setLocalFilters({ ...localFilters, maxPrice: e.target.value })
              }}
              onBlur={(e) => updateFilter("maxPrice", e.target.value)}
            />
          </div>
        </div>

        {/* Color Filter */}
        {colors.length > 0 && (
          <div className="space-y-2">
            <Label>Color</Label>
            <Select
              value={currentFilters.color || "all"}
              onValueChange={(value) => updateFilter("color", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Colors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colors</SelectItem>
                {colors.map((color) => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Material Filter */}
        {materials.length > 0 && (
          <div className="space-y-2">
            <Label>Material</Label>
            <Select
              value={currentFilters.material || "all"}
              onValueChange={(value) => updateFilter("material", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Materials" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Materials</SelectItem>
                {materials.map((material) => (
                  <SelectItem key={material} value={material}>
                    {material}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Stock Filter */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="inStock"
            checked={currentFilters.inStock === "true"}
            onCheckedChange={(checked) => 
              updateFilter("inStock", checked ? "true" : undefined)
            }
          />
          <Label htmlFor="inStock" className="cursor-pointer">
            In Stock Only
          </Label>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <Label>Sort By</Label>
          <Select
            value={currentFilters.sortBy || "newest"}
            onValueChange={(value) => updateFilter("sortBy", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
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
      </CardContent>
    </Card>
  )
}
