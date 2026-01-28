// components/HeroSection.tsx
'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'

// Замените на путь к вашему изображению.
// Файл должен лежать в папке public/images/
import bgImage from "@/images/hero-bg.png"

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null)

  // Хук отслеживает прокрутку страницы относительно этого контейнера
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'], // Начинаем отслеживать, когда верх секции касается верха экрана
  })

  // Магия параллакса: преобразуем прогресс прокрутки (от 0 до 1) в смещение по Y.
  // ["0%", "50%"] означает: в начале image стоит на месте, при полной прокрутке секции image сдвинется вниз на 50% своей высоты.
  // Двигая фон медленнее, чем контент, мы создаем эффект глубины.
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  // Небольшой эффект исчезновения текста при скролле
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section
      ref={ref}
      className="relative h-screen flex items-center justify-center text-center px-4 overflow-hidden"
    >
      {/* --- ПАРАЛЛАКС ФОН --- */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          y: backgroundY, // Применяем вычисленное смещение
          height: '140%', // ВАЖНО: Фон должен быть выше контейнера, чтобы было куда двигаться
          top: '-20%', // Центрируем избыточную высоту
        }}
      >
        {/* Используем Next/Image для оптимизации */}
        <Image
          src={bgImage}
          alt="Astrology Background"
          fill
          priority // Загружаем с высоким приоритетом, т.к. это первый экран
          className="object-cover opacity-60" // opacity-60 чтобы фон не перебивал текст
        />
      </motion.div>

      {/* Градиент поверх картинки для лучшей читаемости текста */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-slate-950 z-5 pointer-events-none"></div>

      {/* --- КОНТЕНТ HERO --- */}
      <motion.div
        style={{ opacity: textOpacity }}
        // ИЗМЕНЕНИЕ: Добавлены 'flex flex-col items-center', чтобы принудительно центрировать всё содержимое
        className="relative z-10 max-w-4xl mx-auto flex flex-col items-center space-y-6 mt-20"
      >
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-amber-300 uppercase tracking-[0.3em] text-sm block font-medium"
        >
          Ваш путь к звездам
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-5xl md:text-7xl font-serif text-white leading-tight drop-shadow-lg text-center"
        >
          Откройте тайны своей судьбы <br /> с лучшими тарологами
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          // ИЗМЕНЕНИЕ: Добавлен 'text-center' для гарантии центрирования текста внутри блока
          className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed text-center"
        >
          Профессиональные консультации, обучение астрологии и магические атрибуты в одном
          мистическом пространстве.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
        >
          {/* ... (кнопки без изменений) ... */}
          <Link
            href="/specialists"
            className="
              relative px-8 py-4 rounded-full font-bold text-slate-950 transition-all
              bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500
              hover:from-amber-200 hover:via-amber-300 hover:to-amber-400
              shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:shadow-[0_0_30px_rgba(251,191,36,0.6)]
              active:scale-95
            "
          >
            Найти специалиста
          </Link>

          <Link
            href="/school"
            className="
              px-8 py-4 rounded-full font-medium text-white transition-all
              border border-amber-200/30 bg-white/5 backdrop-blur-sm
              hover:bg-white/10 hover:border-amber-200/60
            "
          >
            Зарегистрироваться
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
