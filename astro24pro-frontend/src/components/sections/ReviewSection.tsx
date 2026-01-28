// components/ReviewsSection.tsx
'use client' // <--- Обязательно для анимаций

import React from 'react'
import { motion, Variants } from 'framer-motion' // Импортируем motion
import { ReviewCard, ReviewData } from '@/components/cards/ReviewCard'

// --- Данные отзывов ---
const fakeReviews: ReviewData[] = [
  {
    id: 1,
    clientName: 'Елена Калинина',
    city: 'Санкт-Петербург',
    serviceName: 'Натальная карта (Разбор)',
    rating: 5,
    text: 'Я долго сомневалась, стоит ли обращаться, но разбор натальной карты просто открыл мне глаза. Специалист точно описал мои карьерные кризисы и подсказал, в какой сфере меня ждет финансовый успех. Спустя два месяца я сменила работу и невероятно счастлива.',
  },
  {
    id: 2,
    clientName: 'Дмитрий В.',
    city: 'Москва',
    serviceName: 'Таро-расклад «Бизнес»',
    rating: 5,
    text: 'Нужен был совет перед важной сделкой. Карты показали скрытые риски со стороны партнера, о которых я даже не подозревал. Благодаря консультации я пересмотрел договор и избежал потери крупной суммы. Очень профессиональный подход, без "воды".',
  },
  {
    id: 3,
    clientName: 'Алина Громова',
    city: 'Казань',
    serviceName: 'Синастрия (Совместимость)',
    rating: 4,
    text: 'Заказывала расчет совместимости с мужем. Были сложные периоды, не понимали друг друга. Астролог объяснила, что у нас идет период Сатурна и дала рекомендации, как сгладить углы. Отношения стали намного теплее. Спасибо за чуткость!',
  },
]

// --- Настройки анимации ---

// Анимация контейнера (сетки)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      // staggerChildren: 0.3 означает, что каждый дочерний элемент
      // начнет анимацию с задержкой 0.3 сек после предыдущего
      staggerChildren: 0.3,
    },
  },
}

// Анимация отдельной карточки
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 50, // Карточка сдвинута вниз на 50px
  },
  visible: {
    opacity: 1,
    y: 0, // Возвращается на место
    transition: {
      duration: 0.6, // Длительность полета
      ease: 'easeOut',
    },
  },
}

export const ReviewsSection = () => {
  return (
    <section className="py-24 bg-slate-900/50 border-t border-white/5 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Заголовок (тоже можно анимировать для красоты) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} // Анимация проиграется только один раз
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-serif text-white mb-4">Истории клиентов</h2>
          <p className="text-slate-400 text-lg">
            Реальные истории людей, которые нашли ответы на свои вопросы благодаря звездам и картам
            Таро.
          </p>
        </motion.div>

        {/* Сетка отзывов с анимацией */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants} // Подключаем настройки контейнера
          initial="hidden" // Начальное состояние
          whileInView="visible" // Запуск при скролле
          viewport={{ once: true, amount: 0.2 }} // Запустить, когда видно 20% секции
        >
          {fakeReviews.map((review) => (
            // Оборачиваем каждую карточку в motion.div
            <motion.div key={review.id} variants={cardVariants as Variants}>
              {/* h-full нужен, чтобы карточка растягивалась на всю высоту внутри flex-контейнера */}
              <div className="h-full">
                <ReviewCard data={review} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
