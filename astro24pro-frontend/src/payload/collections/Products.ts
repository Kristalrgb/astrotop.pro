// src/payload/collections/Products.ts
import type { CollectionConfig } from 'payload'
import { ROLES, PRODUCT_STATUS } from '../constants'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Товар', plural: 'Товары' },
  access: {
    // @ts-ignore
    read: ({ req: { user } }) => {
      // Если пользователь не залогинен, показываем только опубликованные
      if (!user) return { status: { equals: PRODUCT_STATUS.PUBLISHED } }
      // Админ и Модератор видят все
      if (user.role === ROLES.ADMIN || user.role === ROLES.MODERATOR) return true
      // Специалист видит свои + все опубликованные
      return {
        or: [{ status: { equals: PRODUCT_STATUS.PUBLISHED } }, { owner: { equals: user.id } }],
      }
    },
    // @ts-ignore
    create: ({ req: { user } }) =>
      user && (user.role === ROLES.SPECIALIST || user.role === ROLES.ADMIN),
    // @ts-ignore
    update: ({ req: { user } }) =>
      user &&
      (user.role === ROLES.SPECIALIST ||
        user.role === ROLES.MODERATOR ||
        user.role === ROLES.ADMIN),
  },
  fields: [
    { name: 'title', label: 'Название', type: 'text', required: true },
    { name: 'description', label: 'Описание', type: 'richText' },

    // Связь с Медиа (Галерея)
    {
      name: 'images',
      label: 'Изображения',
      type: 'upload',
      relationTo: 'media', // Убедись, что коллекция media существует
      hasMany: true, // Можно выбрать несколько
    },

    // Владелец (Автозаполнение при создании)
    {
      name: 'owner',
      label: 'Владелец',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      defaultValue: ({ user }: any) => user?.id,
      admin: {
        readOnly: true, // Специалист не может сменить владельца
        position: 'sidebar',
      },
    },

    // Статус (Модерация)
    {
      name: 'status',
      label: 'Статус',
      type: 'select',
      defaultValue: PRODUCT_STATUS.DRAFT,
      options: [
        { label: 'Черновик', value: PRODUCT_STATUS.DRAFT },
        { label: 'На проверке', value: PRODUCT_STATUS.PENDING },
        { label: 'Опубликован', value: PRODUCT_STATUS.PUBLISHED },
      ],
      // Только Модератор и Админ могут ставить статус PUBLISHED
      access: {
        // Проверяем наличие user перед проверкой роли
        update: ({ req: { user } }) =>
          Boolean(user && (user.role === ROLES.MODERATOR || user.role === ROLES.ADMIN)),
      },
    },

    // Цена и Наличие
    {
      type: 'row',
      fields: [
        { name: 'price', label: 'Цена', type: 'number', required: true },
        {
          name: 'currency',
          label: 'Валюта',
          type: 'select',
          options: ['RUB', 'USD'],
          defaultValue: 'RUB',
        },
        { name: 'stock', label: 'В наличии (шт)', type: 'number', defaultValue: 1 },
      ],
    },

    // Отзывы (Вложенный массив)
    {
      name: 'reviews',
      label: 'Отзывы',
      type: 'array',
      fields: [
        { name: 'text', label: 'Текст отзыва', type: 'textarea' },
        { name: 'rating', label: 'Рейтинг', type: 'number', min: 1, max: 5 },
        { name: 'date', label: 'Дата', type: 'date', defaultValue: () => new Date() },
        { name: 'author', label: 'Автор', type: 'relationship', relationTo: 'users' },
      ],
    },
  ],
}
