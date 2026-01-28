// components/specialists/SpecialistsSort.tsx
'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowUpDown } from 'lucide-react'

export const SpecialistsSort = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') || 'newest'

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    const params = new URLSearchParams(searchParams.toString())

    if (value === 'newest') {
      params.delete('sort') // По умолчанию
    } else {
      params.set('sort', value)
    }

    router.push(`/specialists?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-slate-400 text-sm hidden sm:inline flex items-center gap-1">
        <ArrowUpDown size={14} /> Сортировка:
      </span>
      <div className="relative">
        <select
          value={currentSort}
          onChange={handleSortChange}
          className="appearance-none bg-slate-900 border border-white/10 text-white text-sm rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:border-amber-400 cursor-pointer"
        >
          <option value="newest">Новые специалисты</option>
          <option value="price_asc">Цена: По возрастанию</option>
          <option value="price_desc">Цена: По убыванию</option>
          <option value="experience_desc">Опыт: По убыванию</option>
        </select>
        {/* Кастомная стрелочка */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="#94A3B8"
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
