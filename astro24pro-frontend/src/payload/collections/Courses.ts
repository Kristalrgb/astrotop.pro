// src/payload/collections/Courses.ts
import type { CollectionConfig } from 'payload'
import { ROLES, PRODUCT_STATUS } from '../constants'

export const Courses: CollectionConfig = {
  slug: 'courses',
  labels: { singular: 'Курс', plural: 'Курсы' },
  fields: [
    { name: 'title', label: 'Название курса', type: 'text', required: true },
    { name: 'description', label: 'Программа курса', type: 'richText' },
    {
      name: 'author',
      label: 'Преподаватель',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'status',
      label: 'Статус',
      type: 'select',
      defaultValue: PRODUCT_STATUS.DRAFT,
      options: [
        { label: 'Черновик', value: PRODUCT_STATUS.DRAFT },
        { label: 'Опубликован', value: PRODUCT_STATUS.PUBLISHED },
      ],
      // Только Модератор утверждает курсы
      access: {
        update: ({ req: { user } }) => user ?  user.role === ROLES.MODERATOR || user.role === ROLES.ADMIN : false,
      },
    },
    { name: 'price', label: 'Цена', type: 'number' },
    { name: 'startDate', label: 'Дата начала', type: 'date' },
  ],
}
