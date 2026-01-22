"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface FavoritesContextType {
  favorites: Set<string>
  toggleFavorite: (productId: string) => Promise<void>
  isLoading: boolean
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: new Set(),
  toggleFavorite: async () => {},
  isLoading: true,
})

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsLoading(false)
        return
      }

      // Single query to get ALL favorites at once
      const { data } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", user.id)

      if (data) {
        setFavorites(new Set(data.map(f => f.product_id)))
      }
    } catch (error) {
      console.error("Failed to load favorites:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = async (productId: string) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    const isFavorite = favorites.has(productId)

    // Optimistic update
    setFavorites(prev => {
      const next = new Set(prev)
      if (isFavorite) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })

    try {
      if (isFavorite) {
        await fetch('/api/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: productId }),
        })
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: productId }),
        })
      }
    } catch (error) {
      // Revert on error
      setFavorites(prev => {
        const next = new Set(prev)
        if (isFavorite) {
          next.add(productId)
        } else {
          next.delete(productId)
        }
        return next
      })
      console.error('Failed to toggle favorite:', error)
    }
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isLoading }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  return useContext(FavoritesContext)
}
