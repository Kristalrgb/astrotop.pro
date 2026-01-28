// components/specialists/SpecialistsFilters.tsx
'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, Zap } from 'lucide-react'

export const SpecialistsFilters = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Состояние фильтров
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [minExperience, setMinExperience] = useState(searchParams.get('experience') || '')

  // НОВОЕ: Чекбокс "Онлайн" (читаем из URL, если 'true')
  const [isOnline, setIsOnline] = useState(searchParams.get('isOnline') === 'true')

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString()) // Берем текущие (чтобы сохранить сортировку)

    // Обновляем или удаляем параметры
    if (search) params.set('search', search)
    else params.delete('search')
    if (minPrice) params.set('minPrice', minPrice)
    else params.delete('minPrice')
    if (maxPrice) params.set('maxPrice', maxPrice)
    else params.delete('maxPrice')
    if (minExperience) params.set('experience', minExperience)
    else params.delete('experience')

    // Обработка чекбокса
    if (isOnline) params.set('isOnline', 'true')
    else params.delete('isOnline')

    // Сбрасываем пагинацию на 1 страницу при фильтрации (если она есть)
    params.delete('page')

    router.push(`/specialists?${params.toString()}`)
  }

  const resetFilters = () => {
    setSearch('')
    setMinPrice('')
    setMaxPrice('')
    setMinExperience('')
    setIsOnline(false)
    router.push('/specialists')
  }

  return (
    <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 sticky top-24">
      <div className="flex items-center gap-2 mb-6 text-white font-serif text-xl">
        <SlidersHorizontal size={20} className="text-amber-400" />
        Фильтры
      </div>

      <div className="space-y-6">
        {/* Поиск */}
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Поиск</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Имя или специализация..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-lg py-2 pl-3 pr-10 text-white focus:border-amber-400 outline-none transition-colors placeholder:text-slate-600"
            />
            <Search className="absolute right-3 top-2.5 text-slate-500" size={16} />
          </div>
        </div>

        {/* НОВОЕ: Чекбокс Онлайн */}
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-full ${isOnline ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'} transition-colors`}
              >
                <Zap size={16} className={isOnline ? 'fill-current' : ''} />
              </div>
              <span
                className={`text-sm font-medium transition-colors ${isOnline ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}
              >
                Сейчас онлайн
              </span>
            </div>

            <div className="relative">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={isOnline}
                onChange={(e) => setIsOnline(e.target.checked)}
              />
              <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:bg-amber-500 transition-colors"></div>
              <div className="absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform peer-checked:translate-x-5"></div>
            </div>
          </label>
        </div>

        {/* Цена */}
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Стоимость услуги (₽)</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="От"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-1/2 bg-slate-950 border border-white/10 rounded-lg py-2 px-3 text-white focus:border-amber-400 outline-none"
            />
            <input
              type="number"
              placeholder="До"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-1/2 bg-slate-950 border border-white/10 rounded-lg py-2 px-3 text-white focus:border-amber-400 outline-none"
            />
          </div>
        </div>

        {/* Опыт */}
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Опыт работы (лет)</label>
          <input
            type="range"
            min="0"
            max="20"
            value={minExperience || 0}
            onChange={(e) => setMinExperience(e.target.value)}
            className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Любой</span>
            <span>{minExperience ? `от ${minExperience} лет` : 'Не важно'}</span>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={applyFilters}
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(251,191,36,0.2)]"
          >
            Применить
          </button>
          <button
            onClick={resetFilters}
            className="w-full text-slate-400 hover:text-white text-sm py-2 transition-colors"
          >
            Сбросить все
          </button>
        </div>
      </div>
    </div>
  )
} 
