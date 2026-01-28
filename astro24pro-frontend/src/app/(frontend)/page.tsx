import { getPayload } from 'payload'
import configPromise from '@payload-config' // Ваш конфиг payload
import { ArrowRight, Star } from 'lucide-react'
import HeroSection from '@/components/sections/HeroSection'
import { Banner } from '@/components/blocks/Banner'
import bgImage from '/media/405a75238f0fd9cf309b642614fe4218.jpg'
import { SpecialistsSection } from '@/components/sections/SpecialistsSection'
import { BlogSection } from '@/components/sections/BlogSection'
import { ReviewsSection } from '@/components/sections/ReviewSection'

// Функция получения данных
async function getPromotions() {
  const payload = await getPayload({ config: configPromise })

  return await payload.findGlobal({
    slug: 'promotions', // slug нашего Global
    depth: 1,
  })
}
export default async function Home() {
  const promo = await getPromotions()
  const { heroBanner, schoolBanner } = promo
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30">
      <HeroSection />
      {/* 2. Рендерим Баннер под HeroSection (если он активен) */}
      {/*{heroBanner?.isActive && (*/}
      {/*  <Banner*/}
      {/*    style="strip"*/}
      {/*    content={heroBanner.content}*/}
      {/*    link={heroBanner.link || undefined}*/}
      {/*    backgroundImage={bgImage}*/}
      {/*  />*/}
      {/*)}*/}
      <SpecialistsSection />

      {/* --- PROMOTIONAL BANNER (Большой) --- */}

      <section className="py-12 px-4">
        <div className="container mx-auto bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between border border-white/10 relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl font-serif mb-4">Обучение в Школе Магии</h2>
            <p className="text-slate-300 mb-8">
              Пройди путь от новичка до профессионального астролога. Курсы доступны онлайн.
            </p>
            <button className="px-6 py-3 bg-white text-slate-900 rounded-lg font-medium">
              Смотреть программу
            </button>
          </div>
          {/* Декор */}
          <div className="absolute right-0 top-0 w-1/2 h-full bg-amber-500/5 blur-3xl rounded-full"></div>
        </div>
      </section>
      <ReviewsSection />
      {/* --- ОТЗЫВЫ --- */}
      {/*      <section className="py-24 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif text-center mb-16">Истории клиентов</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-950 p-8 rounded-2xl border border-white/5 relative">
                <div className="text-amber-500 text-4xl font-serif absolute top-4 left-4">“</div>
                <p className="text-slate-300 italic mb-6 relative z-10 pt-4">
                  &#34;Невероятный опыт. Астролог помог мне разобраться в карьере, и спустя месяц я
                  получила повышение.&#34;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800"></div>
                  <div>
                    <p className="text-white text-sm font-medium">Анна С.</p>
                    <p className="text-xs text-slate-500">Москва</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>*/}
      <BlogSection />
      {/*--- НОВОСТИ / БЛОГ ---*/}
      {/*      <section className="py-24 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif">Звездный журнал</h2>
          <a href="/blog" className="text-sm text-slate-400 hover:text-white">
            Читать все
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <article key={i} className="cursor-pointer group">
              <div className="h-48 bg-slate-800 rounded-xl mb-4 overflow-hidden">
                Payload Image Placeholder
                <div className="w-full h-full bg-slate-700 transition-transform group-hover:scale-105 duration-500"></div>
              </div>
              <span className="text-xs text-amber-200 uppercase tracking-wider">Прогноз</span>
              <h3 className="text-xl font-serif mt-2 mb-2 group-hover:text-amber-100 transition-colors">
                Гороскоп на ретроградный Меркурий: чего ожидать?
              </h3>
              <p className="text-sm text-slate-400">28 Января 2026</p>
            </article>
          ))}
        </div>
      </section>*/}
    </main>
  )
}
