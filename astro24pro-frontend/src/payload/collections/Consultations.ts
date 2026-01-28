// src/payload/collections/Consultations.ts
import type { CollectionConfig, CollectionSlug } from 'payload'

export const Consultations: CollectionConfig = {
  slug: 'consultations',
  labels: { singular: 'Консультация', plural: 'Консультации' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'client',
          label: 'Клиент',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'specialist',
          label: 'Специалист',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'datetime', label: 'Дата и время', type: 'date', required: true },
        { name: 'duration', label: 'Длительность (мин)', type: 'number', defaultValue: 60 },
      ],
    },
    {
      name: 'type',
      label: 'Тип консультации',
      type: 'select',
      options: ['Видеозвонок', 'Аудиозвонок', 'Чат', 'Личная встреча'],
    },
    {
      name: 'language',
      label: 'Язык проведения',
      type: 'select',
      options: ['RU', 'EN'],
      defaultValue: 'RU',
    },
    {
      name: 'contacts',
      label: 'Контактные данные',
      type: 'group',
      fields: [
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'text' },
      ],
    },
    {
      name: 'wishes',
      label: 'Пожелания / Вопрос',
      type: 'textarea',
    },
    {
      name: 'promocode',
      label: 'Примененный промокод',
      type: 'relationship',
      relationTo: 'promocodes' as CollectionSlug,
    },
  ],
}
