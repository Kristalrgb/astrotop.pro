// src/payload/collections/Promocodes.ts
import type { CollectionConfig } from 'payload'
import { ROLES } from '../constants'

export const Promocodes: CollectionConfig = {
  slug: 'promocodes',
  labels: { singular: 'Промокод', plural: 'Промокоды' },
  admin: {
    useAsTitle: "code",
  },
  access: {
    // ИСПРАВЛЕНИЕ: Сначала проверяем, существует ли user (user && ...)
    create: ({ req: { user } }) =>
      Boolean(user && (user.role === ROLES.SPECIALIST || user.role === ROLES.ADMIN)),

    // Читать могут все (чтобы проверять валидность в корзине)
    read: () => true,

    // Хорошей практикой будет добавить защиту на обновление и удаление
    update: ({ req: { user } }) =>
      Boolean(user && (user.role === ROLES.SPECIALIST || user.role === ROLES.ADMIN)),
    delete: ({ req: { user } }) =>
      Boolean(user && (user.role === ROLES.SPECIALIST || user.role === ROLES.ADMIN)),
  },
  fields: [
    { name: 'code', label: 'Код (текст)', type: 'text', required: true, unique: true },
    { name: 'description', label: 'Описание', type: 'text' },
    {
      name: 'discountPercent',
      label: 'Скидка (%)',
      type: 'number',
      min: 1,
      max: 100,
      required: true,
    },
    { name: 'expirationDate', label: 'Дата истечения', type: 'date', required: true },
    // Кто создал промокод
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      defaultValue: ({ user }: any) => user?.id,
      admin: { readOnly: true },
    },
  ],
}
