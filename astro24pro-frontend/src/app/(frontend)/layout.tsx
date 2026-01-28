// app/layout.tsx
import React from 'react'
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google' // Импорт шрифтов
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './styles.css'

// Настройка шрифта для основного текста (Sans)
const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

// Настройка шрифта для заголовков (Serif)
const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playfair',
  display: 'swap',
})

// SEO Конфигурация
export const metadata: Metadata = {
  title: {
    template: '%s | ASTRA - Астрология и Таро',
    default: 'ASTRA - Услуги профессиональных тарологов и астрологов',
  },
  description:
    'Получите точный астрологический прогноз, разбор натальной карты или расклад таро онлайн. Лучшие специалисты, обучение в школе магии и эзотерический магазин.',
  keywords: [
    'астрология',
    'таро',
    'гороскоп',
    'натальная карта',
    'обучение магии',
    'эзотерика',
    'гадание онлайн',
  ],
  openGraph: {
    title: 'ASTRA - Ваш проводник в мир звезд',
    description: 'Консультации астрологов и тарологов онлайн.',
    type: 'website',
    locale: 'ru_RU',
    siteName: 'ASTRA',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-slate-950 text-slate-200 antialiased min-h-screen flex flex-col">
        {/* Шапка сайта */}
        <Header />

        {/* Основной контент (растягивается на всю свободную высоту) */}
        <main className="flex-grow pt-20">{children}</main>

        {/* Подвал сайта */}
        <Footer />
      </body>
    </html>
  )
}
