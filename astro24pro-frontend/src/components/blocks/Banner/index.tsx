// components/blocks/Banner/index.tsx
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles } from 'lucide-react'

// Обновленный тип данных для Media
// Payload возвращает объект, где есть sizes
type MediaType = {
  url?: string
  alt?: string
  width?: number
  height?: number
  sizes?: {
    mobile?: { url: string }
    tablet?: { url: string }
    desktop?: { url: string }
  }
}

type Props = {
  style: 'strip' | 'card'
  content: string
  link?: string
  buttonText?: string
  backgroundImage?: MediaType | string
}

export const Banner = ({ style, content, link, buttonText, backgroundImage }: Props) => {
  // Получаем URL. Next.js сам оптимизирует исходный URL,
  // если вы используете стандартный Image Loader.
  const imageUrl =
    typeof backgroundImage === 'object' && backgroundImage?.url ? backgroundImage.url : null

  const altText =
    typeof backgroundImage === 'object' && backgroundImage?.alt
      ? backgroundImage.alt
      : 'Banner background'

  // --- ВАРИАНТ 1: Тонкая полоса ---
  if (style === 'strip') {
    return (
      <div className="relative w-full border-y border-white/10 py-4 z-20 overflow-hidden bg-indigo-950">
        {imageUrl && (
          <div className="absolute inset-0 z-0 opacity-40">
            <Image
              src={imageUrl}
              alt={altText}
              fill
              className="object-cover"
              // ЛОГИКА РАЗМЕРОВ ДЛЯ ПОЛОСКИ:
              // Она всегда на всю ширину экрана (100vw).
              // Браузер сам решит, загрузить 300px или 1920px версию.
              sizes="100vw"
            />
          </div>
        )}

        {/* Градиент */}
        <div className="absolute inset-0 bg-indigo-950/60 backdrop-blur-[2px] z-0"></div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 text-sm md:text-base text-amber-200 tracking-widest uppercase font-medium">
            <Sparkles size={16} className="text-amber-400" />
            <span>{content}</span>
            <Sparkles size={16} className="text-amber-400" />
          </div>
          {link && (
            <Link
              href={link}
              className="ml-4 text-xs text-white/60 hover:text-white underline decoration-white/30 underline-offset-4 transition-colors"
            >
              Подробнее
            </Link>
          )}
        </div>
      </div>
    )
  }

  // --- ВАРИАНТ 2: Большая карточка ---
  if (style === 'card') {
    return (
      <section className="py-12 px-4 container mx-auto">
        <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 group shadow-2xl">
          <div className="absolute inset-0 w-full h-full z-0">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={altText}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority
                // ЛОГИКА РАЗМЕРОВ ДЛЯ КАРТОЧКИ:
                // 1. (max-width: 768px) 100vw -> Если это телефон, картинка занимает почти весь экран (100% ширины)
                // 2. (max-width: 1200px) 90vw -> Если планшет, то 90% ширины экрана
                // 3. 1200px -> Если экран огромный (4k), загрузи картинку шириной не более 1200px,
                //    так как контейнер (container mx-auto) ограничивает ширину.
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              />
            ) : (
              <div className="w-full h-full bg-slate-800" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-90"></div>
          </div>

          <div className="relative z-10 min-h-[400px] md:min-h-[500px] p-8 md:p-16 flex flex-col justify-end items-start max-w-3xl">
            <span className="text-amber-300 text-xs font-bold uppercase tracking-[0.2em] border border-amber-300/30 px-3 py-1 rounded-full mb-6 backdrop-blur-md">
              Рекомендуем
            </span>
            <h3 className="text-3xl md:text-5xl lg:text-6xl font-serif text-white leading-tight mb-6 drop-shadow-lg">
              {content}
            </h3>
            {link && (
              <Link
                href={link}
                className="
                  px-8 py-4 rounded-full font-bold text-slate-900 transition-all
                  bg-white hover:bg-amber-200
                  shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]
                "
              >
                {buttonText || 'Подробнее'}
              </Link>
            )}
          </div>
        </div>
      </section>
    )
  }

  return null
}
