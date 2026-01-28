// app/not-found.tsx
import './(frontend)/styles.css' // Твой путь к стилям
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import Link from 'next/link'
import { Home } from 'lucide-react'

// Шрифты
const inter = Inter({ subsets: ['latin', 'cyrillic'] })
const playfair = Playfair_Display({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: '404 - Страница потерялась в космосе | ASTRA',
  description: 'К сожалению, запрашиваемая страница не найдена.',
}

export default function GlobalNotFound() {
  return (
    <html lang="ru">
      <body className={`${inter.className} bg-slate-950 text-slate-200 overflow-hidden`}>
        {/* Контейнер на весь экран с центровкой содержимого (items-center) */}
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
          {/* --- ФОНОВЫЕ ЭЛЕМЕНТЫ --- */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950 to-slate-950 z-0"></div>

          {/* Звезды */}
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full opacity-40 shadow-[0_0_10px_white]"></div>
          <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-amber-100 rounded-full opacity-30"></div>
          <div className="absolute top-1/2 left-10 w-1 h-1 bg-indigo-200 rounded-full opacity-50"></div>

          {/* --- ЦЕНТРАЛЬНАЯ КОМПОЗИЦИЯ --- */}
          {/* text-center выравнивает текст внутри блока, mx-auto центрирует сам блок */}
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            {/* Крупные цифры и Луна */}
            <div className="flex items-center justify-center gap-4 md:gap-8 font-serif font-bold text-[8rem] md:text-[12rem] leading-none text-white/10 select-none">
              <span className={playfair.className}>4</span>

              {/* ЛУНА (Анимация) */}
              <div className="relative w-24 h-24 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 shadow-[0_0_40px_rgba(251,191,36,0.2)] animate-[pulse_4s_ease-in-out_infinite]">
                <div className="absolute top-4 left-6 w-6 h-6 bg-slate-500/30 rounded-full"></div>
                <div className="absolute bottom-6 right-8 w-10 h-10 bg-slate-500/20 rounded-full"></div>
              </div>

              <span className={playfair.className}>4</span>
            </div>

            {/* Текст */}
            <div className="space-y-4 mt-8">
              <h1 className={`${playfair.className} text-3xl md:text-5xl text-white`}>
                Эта страница потерялась в космосе
              </h1>
              {/* mx-auto здесь критически важен для центровки блока текста на широком экране */}
              <p className="text-slate-400 max-w-lg mx-auto text-lg leading-relaxed">
                Звезды не сложились. Страница, которую вы ищете, скрыта в тени или переместилась в
                другое измерение.
              </p>
            </div>

            {/* Кнопка (Стиль HeroSection секции) */}
            <div className="flex justify-center mt-12">
              <Link
                href="/"
                className="
                  flex items-center justify-center gap-2 px-8 py-4 rounded-full
                  font-bold text-slate-950 transition-all
                  bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500
                  hover:from-amber-200 hover:via-amber-300 hover:to-amber-400
                  shadow-[0_0_20px_rgba(251,191,36,0.4)]
                  hover:shadow-[0_0_30px_rgba(251,191,36,0.6)]
                  active:scale-95
                "
              >
                <Home size={20} />
                Вернуться домой
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
