// components/Header.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, User, Globe } from 'lucide-react'

const navLinks = [
  { name: 'Специалисты', href: '/specialists' },
  { name: 'Магазин', href: '/shop' },
  { name: 'Школа', href: '/school' },
  { name: 'О нас', href: '/about' },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Логотип */}
        <Link
          href="/"
          className="text-2xl font-serif font-bold text-indigo-400 tracking-widest uppercase hover:text-indigo-300 transition-colors"
          // Если нажимаем на лого в мобилке, тоже лучше закрыть меню
          onClick={() => setIsOpen(false)}
        >
          ASTRA
        </Link>

        {/* Десктоп навигация */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-300 hover:text-amber-200 uppercase tracking-wider transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="w-px h-6 bg-white/10"></div>

          <div className="flex items-center gap-4">
            <button
              className="text-slate-300 hover:text-white transition-colors"
              aria-label="Сменить язык"
            >
              <Globe size={20} strokeWidth={1.5} />
            </button>
            <Link
              href="/login"
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <User size={20} strokeWidth={1.5} />
              <span className="text-sm font-medium">Войти</span>
            </Link>
          </div>
        </div>

        {/* Мобильная кнопка */}
        <button className="md:hidden text-slate-200" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Мобильное меню */}
      {isOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-slate-950 border-b border-white/10 p-4 flex flex-col gap-4 animate-in slide-in-from-top-5 h-[calc(100vh-80px)]">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-lg text-slate-200 py-2 border-b border-white/5"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex justify-between pt-4 mt-auto pb-8 border-t border-white/10">
            <span className="flex gap-2 text-slate-400 items-center">
              <Globe size={20} /> RU
            </span>

            {/* ИСПРАВЛЕНИЕ ЗДЕСЬ: Добавлен onClick */}
            <Link
              href="/login"
              className="flex gap-2 text-slate-200 items-center font-medium bg-white/10 px-6 py-2 rounded-full"
              onClick={() => setIsOpen(false)}
            >
              <User size={20} /> Войти
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
