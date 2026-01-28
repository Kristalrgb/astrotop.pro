// components/BlogCard.tsx
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

// Тип данных для статьи (примерно так это придет из Payload)
export interface BlogPost {
  id: string | number
  slug: string // ЧПУ для ссылки
  title: string
  category: string
  publishDate: string
  imageUrl?: string // Опционально, если картинки нет
}

interface BlogCardProps {
  data: BlogPost
}

export const BlogCard: React.FC<BlogCardProps> = ({ data }) => {
  const { slug, title, category, publishDate, imageUrl } = data

  return (
    <Link href={`/blog/${slug}`} className="block group">
      <article className="h-full flex flex-col">
        {/* --- Изображение --- */}
        <div className="h-52 w-full bg-slate-800 rounded-xl mb-5 overflow-hidden relative border border-white/5 group-hover:border-amber-500/30 transition-colors">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            // Заглушка, если картинки нет
            <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-500">
              <span className="text-xs uppercase tracking-widest">Нет фото</span>
              {/* Эффект наведения на заглушку */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          )}

          {/* Иконка стрелочки при наведении (дополнительный стиль) */}
          <div className="absolute top-4 right-4 bg-slate-950/80 p-2 rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 border border-white/10">
            <ArrowUpRight size={16} className="text-amber-200" />
          </div>
        </div>

        {/* --- Контент --- */}
        <div className="flex flex-col flex-grow">
          {/* Категория */}
          <span className="text-xs font-bold text-amber-200 uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            {category}
          </span>

          {/* Заголовок */}
          <h3 className="text-xl font-serif text-white leading-tight mb-3 group-hover:text-amber-100 transition-colors">
            {title}
          </h3>

          {/* Дата (прижимаем к низу, если карточки разной высоты, но тут flex-grow решает) */}
          <p className="text-sm text-slate-400 mt-auto pt-2 border-t border-white/5">
            {publishDate}
          </p>
        </div>
      </article>
    </Link>
  )
}
