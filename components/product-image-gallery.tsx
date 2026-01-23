"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ProductImage {
  id: string
  image_url: string
  alt_text: string | null
  display_order: number
  is_primary: boolean
}

interface ProductImageGalleryProps {
  images: ProductImage[]
  productName: string
  isNew?: boolean
  discount?: number
}

export function ProductImageGallery({ images, productName, isNew, discount }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before rendering interactive elements
  useEffect(() => {
    setMounted(true)
  }, [])

  const sortedImages = images.length > 0 
    ? [...images].sort((a, b) => a.display_order - b.display_order)
    : []

  const currentImage = sortedImages[selectedIndex]

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1))
  }

  const handleImageError = (imageId: string) => {
    setImageErrors((prev) => new Set(prev).add(imageId))
  }

  // Keyboard navigation
  useEffect(() => {
    if (!isZoomed || !mounted) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'Escape') setIsZoomed(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isZoomed, mounted])

  // Fallback if no images
  if (!sortedImages || sortedImages.length === 0) {
    return (
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          <Image
            src="/placeholder.svg?height=600&width=600&query=furniture"
            alt={productName}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {isNew && <Badge className="absolute left-4 top-4 bg-primary z-10">New</Badge>}
          {discount && discount > 0 && (
            <Badge className="absolute right-4 top-4 bg-destructive z-10">{discount}% OFF</Badge>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted group">
        <Image
          src={
            imageErrors.has(currentImage.id)
              ? "/placeholder.svg?height=600&width=600&query=furniture"
              : currentImage.image_url
          }
          alt={currentImage.alt_text || productName}
          fill
          className="object-cover cursor-zoom-in"
          priority={selectedIndex === 0}
          loading={selectedIndex === 0 ? "eager" : "lazy"}
          sizes="(max-width: 768px) 100vw, 50vw"
          quality={85}
          onClick={() => mounted && setIsZoomed(true)}
          onError={() => handleImageError(currentImage.id)}
        />

        {/* Badges */}
        {isNew && <Badge className="absolute left-4 top-4 bg-primary z-10">New</Badge>}
        {discount && discount > 0 && (
          <Badge className="absolute right-4 top-4 bg-destructive z-10">{discount}% OFF</Badge>
        )}

        {/* Navigation Arrows */}
        {sortedImages.length > 1 && mounted && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-background/90"
              onClick={handlePrevious}
              aria-label="Previous image"
              type="button"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-background/90"
              onClick={handleNext}
              aria-label="Next image"
              type="button"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Zoom Button */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-background/90"
            onClick={() => setIsZoomed(true)}
            aria-label="Zoom image"
            type="button"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
        )}

        {/* Image Counter */}
        {sortedImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium z-10">
            {selectedIndex + 1} / {sortedImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {sortedImages.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              type="button"
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg bg-muted border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                selectedIndex === index
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-primary/50"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={
                  imageErrors.has(image.id)
                    ? "/placeholder.svg?height=150&width=150&query=furniture"
                    : image.image_url
                }
                alt={image.alt_text || `${productName} - Image ${index + 1}`}
                fill
                className="object-cover"
                loading="lazy"
                sizes="150px"
                quality={60}
                onError={() => handleImageError(image.id)}
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Dialog */}
      {mounted && (
        <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
          <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95">
            <div className="relative w-full h-full">
              <Image
                src={
                  imageErrors.has(currentImage.id)
                    ? "/placeholder.svg?height=1200&width=1200&query=furniture"
                    : currentImage.image_url
                }
                alt={currentImage.alt_text || productName}
                fill
                className="object-contain"
                quality={100}
                sizes="100vw"
                priority
                onError={() => handleImageError(currentImage.id)}
              />
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm hover:bg-background/90 z-20"
                onClick={() => setIsZoomed(false)}
                aria-label="Close"
                type="button"
              >
                <X className="h-5 w-5" />
              </Button>

              {sortedImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 z-20"
                    onClick={handlePrevious}
                    aria-label="Previous image"
                    type="button"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 z-20"
                    onClick={handleNext}
                    aria-label="Next image"
                    type="button"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>

                  {/* Image Counter in Zoom */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium z-20">
                    {selectedIndex + 1} / {sortedImages.length}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
