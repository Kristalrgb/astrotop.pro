import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { ArrowLeft, Star, ShoppingBag, Truck, ShieldCheck } from 'lucide-react'
import { ProductGallery } from '@/components/shop/ProductGallery'
import { ProductData } from '@/types/product'
import { RichText } from '@/components/utils/RichText'

// Типизация параметров страницы
interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })

  // 1. Получаем товар по ID
  let product: any = null
  try {
    product = await payload.findByID({
      collection: 'products',
      id: id,
      depth: 1, // Чтобы получить URL картинок и данные автора отзыва
    })
  } catch (error) {
    // Если ID невалиден или товар не найден
    return notFound()
  }

  // Если товар не опубликован (и мы не админ) - 404
  // (Здесь упрощенная проверка, в идеале нужно проверять права доступа через access control Payload,
  // но findByID вернет ошибку, если нет прав)
  if (!product) return notFound()

  // 2. Подготовка данных (Маппинг)
  const images = Array.isArray(product.images)
    ? product.images.map((img: any) => ({
        id: img.id,
        url: typeof img === 'object' ? img.url : undefined,
        alt: typeof img === 'object' ? img.alt : product.title,
      }))
    : []

  const reviews = Array.isArray(product.reviews) ? product.reviews : []

  // Расчет рейтинга
  const averageRating = reviews.length
    ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length
    : 0

  const formattedPrice = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: product.currency || 'RUB',
    maximumFractionDigits: 0,
  }).format(product.price)

  const isOutOfStock = product.stock <= 0

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 py-12 md:py-24">
      <div className="container mx-auto px-4">
        {/* Хлебные крошки / Назад */}
        <div className="mb-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Вернуться в магазин
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* ЛЕВАЯ КОЛОНКА: ГАЛЕРЕЯ */}
          <div>
            <ProductGallery images={images} title={product.title} />
          </div>

          {/* ПРАВАЯ КОЛОНКА: ИНФОРМАЦИЯ */}
          <div className="flex flex-col h-full">
            {/* Заголовок и Рейтинг */}
            <h1 className="text-3xl md:text-5xl font-serif text-white mb-4 leading-tight">
              {product.title}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center bg-amber-500/10 px-3 py-1 rounded-full gap-1.5 border border-amber-500/20">
                <Star size={16} className="fill-amber-400 text-amber-400" />
                <span className="font-bold text-amber-100">
                  {averageRating > 0 ? averageRating.toFixed(1) : '—'}
                </span>
              </div>
              <span className="text-slate-400 text-sm">
                {reviews.length} {reviews.length === 1 ? 'отзыв' : 'отзывов'}
              </span>
              {/* Статус наличия */}
              <span
                className={`text-sm font-medium ml-auto ${isOutOfStock ? 'text-red-400' : 'text-green-400'}`}
              >
                {isOutOfStock ? 'Нет в наличии' : 'В наличии'}
              </span>
            </div>

            {/* Цена */}
            <div className="text-4xl font-light text-white mb-8">{formattedPrice}</div>

            {/* Описание */}
            <div className="mb-8">
              {/* Используем наш компонент для рендеринга description */}
              <RichText content={product.description} />

              {/* Если описания нет, можно показать фоллбэк */}
              {(!product.description || !product.description.root) && (
                <p className="text-slate-500 italic">Описание отсутствует.</p>
              )}
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-4 mb-10 border-b border-white/10 pb-10">
              <button
                disabled={isOutOfStock}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                  isOutOfStock
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                }`}
              >
                <ShoppingBag size={20} />
                {isOutOfStock ? 'Раскуплено' : 'Добавить в корзину'}
              </button>

              {/* Кнопка "В избранное" (заготовка) */}
              <button className="w-14 h-14 flex items-center justify-center rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-slate-400 hover:text-red-400">
                <Star size={24} />
              </button>
            </div>

            {/* Блок с преимуществами */}
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-400 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-amber-400">
                  <Truck size={20} />
                </div>
                <span>
                  Быстрая доставка
                  <br />
                  по всему миру
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-amber-400">
                  <ShieldCheck size={20} />
                </div>
                <span>
                  Гарантия качества
                  <br />и аутентичности
                </span>
              </div>
            </div>

            {/* --- БЛОК ОТЗЫВОВ --- */}
            <div>
              <h3 className="text-2xl font-serif text-white mb-6">Отзывы покупателей</h3>

              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review: any) => (
                    <div
                      key={review.id}
                      className="bg-slate-900/50 p-6 rounded-2xl border border-white/5"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          {/* Аватар автора (заглушка) */}
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-amber-200 font-serif font-bold">
                            {review.author?.name ? review.author.name[0] : 'U'}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {review.author?.name || 'Пользователь'} {review.author?.surname || ''}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(review.date).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                        {/* Рейтинг отзыва */}
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < review.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-slate-800 text-slate-800'
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-300 italic">"{review.text}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 italic">
                  Пока нет отзывов. Станьте первым, кто оценит этот магический артефакт.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
