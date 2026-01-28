'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ProductImage } from '@/types/product'

interface ProductGalleryProps {
  images: ProductImage[]
  title: string
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, title }) => {
  // Если картинок нет, используем заглушку
  const hasImages = images.length > 0
  const [activeImage, setActiveImage] = useState<string | null>(
    hasImages ? images[0].url || null : null,
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Главное изображение */}
      <div className="relative aspect-square w-full bg-slate-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={title}
            fill
            className="object-cover"
            priority // Загружаем сразу
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-600">
            Нет изображения
          </div>
        )}
      </div>

      {/* Миниатюры (показываем только если картинок > 1) */}
      {hasImages && images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => setActiveImage(img.url || null)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                activeImage === img.url
                  ? 'border-amber-500 opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-80'
              }`}
            >
              {img.url && (
                <Image src={img.url} alt={img.alt || title} fill className="object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
