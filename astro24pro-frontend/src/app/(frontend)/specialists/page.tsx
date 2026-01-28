// app/specialists/page.tsx
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SpecialistsFilters } from '@/components/specialists/SpecialistsFilters'
import { SpecialistsSort } from '@/components/specialists/SpecialistsSort' // Импорт сортировки
import { SpecialistCard, SpecialistData } from '@/components/cards/SpecialistCard'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

interface Media {
  url?: string
}

export default async function SpecialistsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const payload = await getPayload({ config: configPromise })

  // --- 1. СБОРКА ФИЛЬТРОВ (WHERE) ---
  const query: any = {
    and: [{ role: { equals: 'specialist' } }],
  }

  // ... (Код фильтров поиска, цены и опыта остается таким же) ...
  if (params.search && typeof params.search === 'string') {
    query.and.push({
      or: [
        { name: { contains: params.search } },
        { surname: { contains: params.search } },
        { 'specialistDetails.specialization': { contains: params.search } },
      ],
    })
  }
  if (params.minPrice)
    query.and.push({
      'specialistDetails.serviceCost.amount': { greater_than_equal: Number(params.minPrice) },
    })
  if (params.maxPrice)
    query.and.push({
      'specialistDetails.serviceCost.amount': { less_than_equal: Number(params.maxPrice) },
    })
  if (params.experience)
    query.and.push({
      'specialistDetails.experience': { greater_than_equal: Number(params.experience) },
    })

  // Фильтр: Онлайн (Заготовка)
  // Поскольку в БД поля isOnline пока нет, этот фильтр сейчас ничего не изменит в запросе,
  // но логика уже готова. Позже добавите поле в Users и раскомментируете строку ниже.
  if (params.isOnline === 'true') {
    // query.and.push({ isOnline: { equals: true } })
  }

  // --- 2. ОБРАБОТКА СОРТИРОВКИ (SORT) ---
  let sortString = '-createdAt' // По умолчанию: сначала новые

  if (params.sort) {
    switch (params.sort) {
      case 'price_asc':
        // Сортировка по вложенному полю цены (возрастание)
        sortString = 'specialistDetails.serviceCost.amount'
        break
      case 'price_desc':
        // Убывание (минус перед полем)
        sortString = '-specialistDetails.serviceCost.amount'
        break
      case 'experience_desc':
        sortString = '-specialistDetails.experience'
        break
      case 'newest':
      default:
        sortString = '-createdAt'
    }
  }

  // --- 3. ЗАПРОС К PAYLOAD ---
  const { docs } = await payload.find({
    collection: 'users',
    where: query,
    sort: sortString, // Передаем параметр сортировки
    depth: 1,
    limit: 10,
  })

  // --- 4. МАППИНГ ДАННЫХ ---
  const specialists: SpecialistData[] = docs.map((user: any) => {
    // ... (Тут ваш код маппинга: avatarUrl, reviews и т.д.) ...
    const avatarUrl =
      user.avatar && typeof user.avatar === 'object' && 'url' in user.avatar
        ? (user.avatar as Media).url
        : undefined

    const mappedReviews = Array.isArray(user.specialistDetails?.reviews)
      ? user.specialistDetails.reviews.map((r: any) => ({
          id: r.id,
          text: r.text,
          rating: r.rating,
          authorName: r.authorName,
          date: r.date,
        }))
      : []

    return {
      id: user.id,
      firstName: user.name,
      lastName: user.surname,
      patronymic: user.patronymic,
      specialization: user.specialistDetails?.specialization || 'Специалист',
      bio: user.specialistDetails?.biography || '',
      experience: user.specialistDetails?.experience || 0,
      price: user.specialistDetails?.serviceCost?.amount || 0,
      currency: user.specialistDetails?.serviceCost?.currency || 'RUB',
      imageUrl: avatarUrl,
      reviews: mappedReviews,
      rating: 0,
      reviewsCount: 0,
    }
  })

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      <div className="container mx-auto px-4 py-12 md:py-24">
        {/* Заголовок + Сортировка (в одну строку на больших экранах) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">Наши эксперты</h1>
            <p className="text-slate-400 text-lg max-w-xl">
              Найдите своего проводника в мир эзотерики.
            </p>
          </div>

          {/* Блок сортировки */}
          <SpecialistsSort />
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* ЛЕВАЯ КОЛОНКА: ФИЛЬТРЫ */}
          <aside className="w-full md:w-1/4">
            <SpecialistsFilters />
          </aside>

          {/* ПРАВАЯ КОЛОНКА: СПИСОК */}
          <div className="w-full md:w-3/4">
            {specialists.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {specialists.map((specialist) => (
                  <SpecialistCard key={specialist.id} data={specialist} />
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/50 rounded-2xl p-12 text-center border border-white/5">
                <div className="text-6xl mb-4 grayscale opacity-50">🔮</div>
                <h3 className="text-2xl font-serif text-white mb-2">Никого не найдено</h3>
                <p className="text-slate-400">Попробуйте смягчить условия фильтрации.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
