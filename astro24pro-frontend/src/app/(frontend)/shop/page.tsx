import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { ShopSidebar } from '@/components/shop/ShopSidebar'
import { ProductCard } from '@/components/cards/ProductCard'
import { ProductData } from '@/types/product'
import { PRODUCT_STATUS } from '@/payload/constants'
import { ShopSort } from '@/components/shop/ShopSort' // Убедитесь, что путь верен

// Тип для пропсов страницы
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ShopPage({ searchParams }: PageProps) {
  const params = await searchParams
  const payload = await getPayload({ config: configPromise })

  // --- 1. СБОРКА ЗАПРОСА (WHERE) ---
  const query: any = {
    and: [
      { status: { equals: PRODUCT_STATUS.PUBLISHED } }, // Показываем только опубликованные
    ],
  }

  // Фильтр: Поиск по названию
  if (params.search && typeof params.search === 'string') {
    query.and.push({
      title: { contains: params.search },
    })
  }

  // Фильтр: Цена
  if (params.minPrice) {
    query.and.push({ price: { greater_than_equal: Number(params.minPrice) } })
  }
  if (params.maxPrice) {
    query.and.push({ price: { less_than_equal: Number(params.maxPrice) } })
  }

  // --- 2. СОРТИРОВКА ---
  let sortString = '-createdAt' // По умолчанию: новые сверху
  if (params.sort === 'price_asc') sortString = 'price'
  if (params.sort === 'price_desc') sortString = '-price'

  // --- 3. ЗАПРОС К PAYLOAD ---
  const { docs } = await payload.find({
    collection: 'products',
    where: query,
    sort: sortString,
    depth: 1, // Чтобы получить URL картинок
    limit: 12, // Пагинация (можно добавить позже)
  })

  // --- 4. МАППИНГ ДАННЫХ ---
  // Превращаем сырые данные Payload в удобный интерфейс ProductData
  const products: ProductData[] = docs.map((doc: any) => ({
    id: doc.id,
    title: doc.title,
    price: doc.price,
    currency: doc.currency,
    stock: doc.stock,
    // Обработка картинок (проверка, массив ли это и есть ли URL)
    images: Array.isArray(doc.images)
      ? doc.images.map((img: any) => ({
          id: img.id,
          url: typeof img === 'object' ? img.url : undefined,
          alt: typeof img === 'object' ? img.alt : doc.title,
        }))
      : [],
    // Обработка отзывов
    reviews: Array.isArray(doc.reviews)
      ? doc.reviews.map((r: any) => ({
          id: r.id,
          rating: r.rating,
          text: r.text,
        }))
      : [],
  }))

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      <div className="container mx-auto px-4 py-12 md:py-24">
        {/* Заголовок */}
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">Магическая лавка</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Артефакты, созданные нашими мастерами для гармонизации пространства и души.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* ЛЕВАЯ КОЛОНКА: ФИЛЬТРЫ */}
          <aside className="w-full md:w-1/4">
            <ShopSidebar />
          </aside>

          {/* ПРАВАЯ КОЛОНКА: ТОВАРЫ */}
          <div className="w-full md:w-3/4">
            {/* --- ВЕРХНЯЯ ПАНЕЛЬ СПИСКА (НОВОЕ) --- */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <p className="text-slate-400 text-sm">
                Найдено товаров: <span className="text-white font-bold">{products.length}</span>
              </p>

              {/* Компонент Сортировки */}
              <ShopSort />
            </div>
            {/* ------------------------------------- */}

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} data={product} />
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/50 rounded-2xl p-12 text-center border border-white/5 h-64 flex flex-col items-center justify-center">
                <div className="text-4xl mb-4 opacity-50">🕯️</div>
                <h3 className="text-xl font-serif text-white mb-2">Товары не найдены</h3>
                <p className="text-slate-400 text-sm">Попробуйте изменить параметры фильтрации.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
