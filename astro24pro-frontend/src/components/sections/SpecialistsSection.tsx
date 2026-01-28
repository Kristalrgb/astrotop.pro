import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SpecialistCard, SpecialistData } from '@/components/cards/SpecialistCard'

// Тип для медиа-объекта из Payload (чтобы TS не ругался на .url)
interface Media {
  url?: string
  alt?: string
}

// Функция получения данных
async function getSpecialists(): Promise<SpecialistData[]> {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'users',
    where: {
      role: {
        equals: 'specialist', // Фильтруем только специалистов
      },
    },
    limit: 4, // Берем 4 карточки для главной
    depth: 1, // Важно! Разворачиваем ID картинки в объект с URL
  })

  // Маппинг данных: Payload (Backend) -> SpecialistCard (Frontend)
  return docs.map((user: any) => {
    // 1. Обработка Аватара
    const avatarUrl =
      user.avatar && typeof user.avatar === 'object' && 'url' in user.avatar
        ? user.avatar?.url
        : undefined
    // Если в базе есть массив reviews, преобразуем его. Иначе - пустой массив.
    const mappedReviews = Array.isArray(user.reviews)
      ? user.reviews.map((r: any) => ({
          id: r.id,
          text: r.text,
          rating: r.rating,
          authorName: r.authorName,
          date: r.date,
        }))
      : []

    return {
      id: user.id,
      firstName: user.name || 'Имя',
      lastName: user.surname || 'Фамилия',
      patronymic: user.patronymic,

      // Данные из группы specialistDetails
      specialization: user.specialistDetails?.specialization || 'Специалист',
      bio: user.specialistDetails?.biography || 'Описание отсутствует',
      experience: user.specialistDetails?.experience || 0,

      // Стоимость
      price: user.specialistDetails?.serviceCost?.amount || 0,
      currency: user.specialistDetails?.serviceCost?.currency || 'RUB',

      imageUrl: avatarUrl,

      // Передаем массив отзывов для автоматического расчета рейтинга в карточке
      reviews: mappedReviews,

      // На всякий случай передаем нули для старых полей (они пересчитаются в карточке, если reviews не пуст)
      rating: 0,
      reviewsCount: 0,
    }
  })
}

export const SpecialistsSection = async () => {
  // Выполняем запрос на сервере
  const specialists = await getSpecialists()

  // Если специалистов нет, скрываем секцию (или можно показать "Нет данных")
  if (!specialists || specialists.length === 0) {
    return null
  }

  return (
    <section className="py-24 container mx-auto px-4">
      {/* Header секции */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-2">Наши эксперты</h2>
          <p className="text-slate-400 text-lg">Люди, которые видят больше, чем доступно глазу.</p>
        </div>
        <Link
          href="/specialists"
          className="hidden md:flex items-center gap-2 text-amber-200 hover:text-white transition-colors font-medium uppercase tracking-wider text-sm"
        >
          Все специалисты <ArrowRight size={18} />
        </Link>
      </div>

      {/* Grid сетка карточек */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {specialists.map((specialist) => (
          <SpecialistCard key={specialist.id} data={specialist} />
        ))}
      </div>

      {/* Кнопка "Смотреть всех" для мобильных */}
      <div className="mt-10 text-center md:hidden">
        <Link
          href="/specialists"
          className="inline-flex items-center gap-2 text-amber-200 border-b-2 border-amber-200/30 pb-1 hover:border-amber-200 transition-colors font-medium"
        >
          Смотреть всех экспертов <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}
