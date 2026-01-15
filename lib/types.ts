export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
  image_url: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  sku: string
  description: string | null
  price: number
  original_price: number | null
  category_id: string | null
  dimensions: string | null
  material: string | null
  color: string | null
  stock_quantity: number
  is_featured: boolean
  is_new: boolean
  rating: number
  review_count: number
  created_at: string
  updated_at: string
  category?: Category
  images?: ProductImage[]
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  alt_text: string | null
  display_order: number
  is_primary: boolean
  created_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
  product?: Product
}

export interface Address {
  id: string
  user_id: string
  full_name: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string | null
  postal_code: string
  country: string
  phone: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string | null
  order_number: string
  status: string
  subtotal: number
  tax: number
  shipping_cost: number
  total: number
  shipping_full_name: string
  shipping_address_line1: string
  shipping_address_line2: string | null
  shipping_city: string
  shipping_state: string | null
  shipping_postal_code: string
  shipping_country: string
  shipping_phone: string
  payment_method: string | null
  payment_status: string
  stripe_payment_intent_id: string | null
  guest_email: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}
