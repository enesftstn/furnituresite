"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface ProductVariant {
  id: string
  name: string
  sku: string
  price_adjustment: number
  stock_quantity: number
  attributes: Record<string, string>
}

interface ProductVariantSelectorProps {
  variants: ProductVariant[]
  selectedVariantId?: string
  onVariantChange: (variantId: string, variant: ProductVariant) => void
}

export function ProductVariantSelector({ variants, selectedVariantId, onVariantChange }: ProductVariantSelectorProps) {
  const [selectedId, setSelectedId] = useState(selectedVariantId || variants[0]?.id)

  const handleChange = (variantId: string) => {
    setSelectedId(variantId)
    const variant = variants.find((v) => v.id === variantId)
    if (variant) {
      onVariantChange(variantId, variant)
    }
  }

  if (!variants || variants.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <Label>Select Variant</Label>
      <RadioGroup value={selectedId} onValueChange={handleChange}>
        {variants.map((variant) => (
          <div key={variant.id} className="flex items-center space-x-2">
            <RadioGroupItem value={variant.id} id={variant.id} disabled={variant.stock_quantity === 0} />
            <Label htmlFor={variant.id} className="flex flex-1 cursor-pointer items-center justify-between">
              <span>
                {variant.name}
                {variant.stock_quantity === 0 && <span className="ml-2 text-sm text-destructive">(Out of stock)</span>}
              </span>
              {variant.price_adjustment !== 0 && (
                <span className="text-sm text-muted-foreground">
                  {variant.price_adjustment > 0 ? "+" : ""}₺{variant.price_adjustment.toFixed(2)}
                </span>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
