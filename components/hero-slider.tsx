"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Slide {
  id: number
  title: string
  description: string
  image: string
  link: string
  buttonText: string
}

const slides: Slide[] = [
  {
    id: 1,
    title: "New Collection 2024",
    description: "Discover our latest furniture designs for modern living spaces",
    image: "/modern-living-room-furniture-2024.jpg",
    link: "/products?filter=new",
    buttonText: "Shop New Arrivals",
  },
  {
    id: 2,
    title: "Up to 50% Off",
    description: "Limited time offer on selected bedroom furniture",
    image: "/bedroom-furniture-sale.jpg",
    link: "/deals",
    buttonText: "Shop Deals",
  },
  {
    id: 3,
    title: "Smart Storage Solutions",
    description: "Organize your home with our versatile storage systems",
    image: "/storage-furniture-organization.jpg",
    link: "/categories/storage-organization",
    buttonText: "Explore Storage",
  },
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section className="relative h-[500px] overflow-hidden bg-muted">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.image || "/placeholder.svg"}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/30" />
          <div className="container relative flex h-full items-center">
            <div className="max-w-2xl space-y-4">
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl text-balance">{slide.title}</h1>
              <p className="text-lg text-muted-foreground md:text-xl text-pretty">{slide.description}</p>
              <Button size="lg" asChild>
                <Link href={slide.link}>{slide.buttonText}</Link>
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-lg transition hover:bg-background"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-lg transition hover:bg-background"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 w-2 rounded-full transition-all ${
              index === currentSlide ? "w-8 bg-primary" : "bg-background/60 hover:bg-background/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
