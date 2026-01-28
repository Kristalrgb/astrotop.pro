'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, ShoppingBag } from 'lucide-react'
import { ProductData } from '@/types/product'

interface ProductCardProps {
  data: ProductData
}

export const ProductCard: React.FC<ProductCardProps> = ({ data }) => {
  const { id, title, price, currency, stock, images, reviews } = data

  // 1. Берем первое изображение или заглушку
  const mainImage = images?.[0]?.url || null

  // 2. Считаем средний рейтинг
  const averageRating = reviews?.length
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0

  // 3. Форматируем цену
  const formattedPrice = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(price)

  const isOutOfStock = stock <= 0

  return (
    <Link href={`/shop/${id}`} className="group block h-full">
      <article className="relative h-full bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/30 hover:bg-slate-900/60 transition-all duration-300 flex flex-col">
        {/* --- ИЗОБРАЖЕНИЕ --- */}
        <div className="relative aspect-square overflow-hidden bg-slate-800">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={title}
              fill
              className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              Нет фото
            </div>
          )}

          {/* Бейдж "Нет в наличии" */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <span className="px-3 py-1 bg-slate-950/80 text-white text-xs font-bold uppercase tracking-widest border border-white/10 rounded-full">
                Распродано
              </span>
            </div>
          )}
        </div>

        {/* --- КОНТЕНТ --- */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Рейтинг */}
          <div className="flex items-center gap-1 mb-2">
            <Star
              size={14}
              className={`${averageRating > 0 ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
            />
            <span className="text-xs text-slate-400 font-medium">
              {averageRating > 0 ? averageRating.toFixed(1) : 'Нет отзывов'}
            </span>
          </div>

          {/* Заголовок */}
          <h3 className="text-lg font-serif text-white mb-2 line-clamp-2 group-hover:text-amber-200 transition-colors">
            {title}
          </h3>

          {/* Низ карточки: Цена и Кнопка */}
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
            <span className="text-xl font-medium text-amber-100">{formattedPrice}</span>

            {/* Кнопка (визуальная) */}
            <button
              disabled={isOutOfStock}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isOutOfStock
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-white/5 hover:bg-amber-500 hover:text-slate-900 text-amber-400'
              }`}
            >
              <ShoppingBag size={18} />
            </button>
          </div>
        </div>
      </article>
    </Link>
  )
}
