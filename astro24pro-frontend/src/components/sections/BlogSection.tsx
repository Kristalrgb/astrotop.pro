// components/BlogSection.tsx
import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { BlogCard, BlogPost } from '@/components/cards/BlogCard'

// --- Моковые данные (позже заменишь на fetch из Payload) ---
const dummyPosts: BlogPost[] = [
  {
    id: 1,
    slug: 'retrograde-mercury-2026',
    title: 'Гороскоп на ретроградный Меркурий: чего ожидать знакам зодиака?',
    category: 'Прогноз',
    publishDate: '28 Января 2026',
    // imageUrl: '/path/to/img1.jpg',
  },
  {
    id: 2,
    slug: 'tarot-cards-meanings',
    title: 'Старшие Арканы Таро: путь героя и значение карт',
    category: 'Обучение',
    publishDate: '25 Января 2026',
  },
  {
    id: 3,
    slug: 'moon-phases-magic',
    title: 'Магия лунных фаз: как планировать дела по лунному календарю',
    category: 'Эзотерика',
    publishDate: '20 Января 2026',
  },
]
// ----------------------------------------------------------

export const BlogSection = () => {
  return (
    <section className="py-24 container mx-auto px-4">
      {/* Заголовок секции */}
      <div className="flex items-end justify-between mb-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-2">Звездный журнал</h2>
          <p className="text-slate-400">Полезные статьи о влиянии планет и магии.</p>
        </div>

        <Link
          href="/blog"
          className="hidden md:flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm uppercase tracking-wider"
        >
          Читать все <ArrowRight size={16} />
        </Link>
      </div>

      {/* Сетка статей */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {dummyPosts.map((post) => (
          <BlogCard key={post.id} data={post} />
        ))}
      </div>

      {/* Кнопка "Читать все" для мобильных */}
      <div className="mt-10 text-center md:hidden">
        <Link
          href="/blog"
          className="inline-block border-b border-slate-500 pb-1 text-slate-400 hover:text-white transition-colors"
        >
          Перейти в блог
        </Link>
      </div>
    </section>
  )
}
