// types/product.ts

export interface ProductImage {
  id: string
  url?: string
  alt?: string
}

export interface ProductReview {
  id: string
  rating: number
  text?: string
}

export interface ProductData {
  id: string
  title: string
  price: number
  currency: 'RUB' | 'USD'
  stock: number
  images: ProductImage[]
  reviews: ProductReview[]
  slug?: string // Если есть slug, иначе используем id для ссылки
}
