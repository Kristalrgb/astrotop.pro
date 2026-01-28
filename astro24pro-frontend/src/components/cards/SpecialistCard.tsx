// components/SpecialistCard.tsx
import React from 'react'
import Image from 'next/image'
import { Star } from 'lucide-react'

// 1. Интерфейс одного отзыва
export interface Review {
  id?: string | number
  text: string
  rating: number
  authorName: string
  date?: string
}

// 2. Обновленный интерфейс специалиста
export interface SpecialistData {
  id: number | string
  firstName: string
  lastName: string
  patronymic?: string | null
  specialization: string
  experience: number
  price: number
  currency: 'RUB' | 'USD' | 'EUR'
  bio: string
  imageUrl?: string

  // Массив отзывов (делаем опциональным, чтобы не ломать старый код)
  reviews?: Review[]

  // Оставляем как запасной вариант (fallback), если массив пуст
  rating?: number
  reviewsCount?: number
}

interface SpecialistCardProps {
  data: SpecialistData
}

// Хелпер валюты
const getCurrencySymbol = (currency: string) => {
  switch (currency) {
    case 'RUB':
      return '₽'
    case 'USD':
      return '$'
    case 'EUR':
      return '€'
    default:
      return currency
  }
}

export const SpecialistCard: React.FC<SpecialistCardProps> = ({ data }) => {
  const {
    firstName,
    lastName,
    patronymic,
    specialization,
    experience,
    price,
    currency,
    bio,
    imageUrl,
    reviews = [], // Дефолтное значение - пустой массив
    rating: staticRating = 0, // Переименовали для ясности
    reviewsCount: staticCount = 0,
  } = data
  console.log(imageUrl)
  // --- ЛОГИКА РАСЧЕТА РЕЙТИНГА ---
  // Если есть массив отзывов, считаем по нему. Если нет - берем статику.
  const hasReviews = reviews.length > 0

  const displayCount = hasReviews ? reviews.length : staticCount

  const displayRating = hasReviews
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : staticRating

  return (
    <div className="group flex flex-row items-start gap-4 md:gap-6 p-4 rounded-2xl transition-all hover:bg-white/5 hover:-translate-y-1 cursor-pointer border border-transparent hover:border-white/5">
      {/* --- Аватар --- */}
      <div className="relative shrink-0 w-24 md:w-32 aspect-[4/5] bg-slate-800 rounded-xl overflow-hidden shadow-lg shadow-slate-950/50">
        {imageUrl ? (
          <Image
            src={`http://localhost:3000${imageUrl}`}
            alt={`${firstName} ${lastName}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-slate-700 animate-pulse"></div>
        )}
      </div>

      {/* --- Информация --- */}
      <div className="flex flex-col pt-1 w-full">
        <h3 className="text-xl font-serif text-white leading-tight group-hover:text-amber-200 transition-colors">
          {lastName} {firstName} {patronymic && ` ${patronymic}`}
        </h3>

        <div className="mb-3 mt-1">
          <p className="text-sm text-amber-300/90 font-medium uppercase tracking-wider">
            {specialization}
          </p>
        </div>

        {/* --- Рейтинг (Динамический) и Опыт --- */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-amber-500/10 px-2 py-0.5 rounded-full gap-1">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              {/* toFixed(1) оставит одну цифру после запятой (например 4.8) */}
              <span className="font-bold text-amber-100 text-xs">{displayRating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-slate-400">({displayCount} отзывов)</span>
          </div>

          <div className="text-xs text-slate-400 border-l border-white/10 pl-4">
            Опыт: <span className="text-slate-200">{experience} лет</span>
          </div>
        </div>

        <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed mb-3">{bio}</p>

        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-slate-500">Консультация:</span>
          <span className="text-white font-medium font-serif text-lg">
            {price && price.toLocaleString('ru-RU')} {getCurrencySymbol(currency)}
          </span>
        </div>
      </div>
    </div>
  )
}
