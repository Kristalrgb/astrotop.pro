'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowUpDown } from 'lucide-react'

export const ShopSort = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') || 'newest'

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    const params = new URLSearchParams(searchParams.toString())

    // Обновляем параметр сортировки
    if (value === 'newest') {
      params.delete('sort') // По умолчанию
    } else {
      params.set('sort', value)
    }

    router.push(`/shop?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3 bg-slate-900/50 border border-white/5 px-4 py-2 rounded-xl">
      <span className="text-slate-400 text-sm hidden sm:flex items-center gap-1">
        <ArrowUpDown size={14} /> Сортировка:
      </span>
      <div className="relative">
        <select
          value={currentSort}
          onChange={handleSortChange}
          className="appearance-none bg-transparent text-white text-sm focus:outline-none cursor-pointer pr-6 font-medium"
        >
          <option value="newest" className="bg-slate-900 text-slate-300">
            Новинки
          </option>
          <option value="price_asc" className="bg-slate-900 text-slate-300">
            Сначала дешевые
          </option>
          <option value="price_desc" className="bg-slate-900 text-slate-300">
            Сначала дорогие
          </option>
        </select>
        {/* Кастомная стрелочка */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
