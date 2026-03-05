export interface Product {
  id: string
  name: string
  brand: string
  price: number
  originalPrice: number
  category: Category
  rating: number
  reviewCount: number
  images: string[]
  description: string
  isExpress: boolean
  discount: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export type Category = 'All' | 'Electronics' | 'Beauty' | 'Kitchen' | 'Fashion' | 'Home'

export interface FlyToCartPayload {
  imageUri: string
  startX: number
  startY: number
}
