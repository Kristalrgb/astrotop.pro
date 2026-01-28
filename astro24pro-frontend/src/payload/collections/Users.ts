// src/payload/collections/Users.ts
import type { CollectionConfig, CollectionSlug } from 'payload'
import { ROLES } from '../constants'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true, // Включает email/password и авторизацию
  admin: {
    useAsTitle: 'email',
  },
  access: {
    // Админ может все, остальные читают свои данные или публичные профили специалистов
    read: () => true,
  },
  fields: [
    // --- Аватар пользователя (НОВОЕ ПОЛЕ) ---
    {
      name: 'avatar',
      label: 'Аватар',
      type: 'upload',
      relationTo: 'media', // Связь с коллекцией media
    },

    // --- Основная информация ---
    {
      type: 'row',
      fields: [
        { name: 'surname', label: 'Фамилия', type: 'text', required: true },
        { name: 'name', label: 'Имя', type: 'text', required: true },
        { name: 'patronymic', label: 'Отчество', type: 'text' },
      ],
    },
    {
      name: 'role',
      label: 'Роль',
      type: 'select',
      defaultValue: ROLES.CLIENT,
      required: true,
      options: [
        { label: 'Клиент', value: ROLES.CLIENT },
        { label: 'Специалист', value: ROLES.SPECIALIST },
        { label: 'Модератор', value: ROLES.MODERATOR },
        { label: 'Администратор', value: ROLES.ADMIN },
      ],
    },

    // --- Поля для Специалиста (Условное отображение) ---
    {
      name: 'specialistDetails',
      label: 'Данные специалиста',
      type: 'group',
      admin: {
        // Показываем группу только если роль = specialist
        condition: (data) => data.role === ROLES.SPECIALIST,
      },
      fields: [
        {
          name: 'specialization',
          label: 'Специализация (Астролог, Таролог)',
          type: 'text',
          required: true,
        },
        { name: 'experience', label: 'Опыт работы (лет)', type: 'number', required: true },
        { name: 'biography', label: 'Биография', type: 'textarea', required: true },
        {
          name: 'serviceCost',
          label: 'Базовая стоимость услуги',
          type: 'group',
          fields: [
            { name: 'amount', type: 'number', required: true },
            {
              name: 'currency',
              type: 'select',
              options: ['RUB', 'USD', 'EUR'],
              defaultValue: 'RUB',
            },
          ],
        },
        {
          name: 'reviews',
          label: 'Отзывы клиентов',
          type: 'array',
          admin: {
            // Показывать это поле только если роль пользователя - Специалист
            condition: (data) => data.role === ROLES.SPECIALIST,
          },
          fields: [
            {
              name: 'rating',
              label: 'Оценка (1-5)',
              type: 'number',
              min: 1,
              max: 5,
              required: true,
            },
            {
              name: 'text',
              label: 'Текст отзыва',
              type: 'textarea',
              required: true,
            },
            {
              name: 'authorName',
              label: 'Имя клиента',
              type: 'text',
              required: true,
            },
            {
              name: 'date',
              label: 'Дата',
              type: 'date',
              defaultValue: () => new Date(),
            },
            // Опционально: связь с реальным аккаунтом клиента
            {
              name: 'clientAccount',
              label: 'Аккаунт клиента',
              type: 'relationship',
              relationTo: 'users',
            },
          ],
        },
      ],
    },

    // --- Корзина (Для Клиента) ---
    {
      name: 'cart',
      label: 'Корзина товаров',
      type: 'array',
      admin: {
        condition: (data) => data.role === ROLES.CLIENT,
      },
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products' as CollectionSlug,
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          defaultValue: 1,
          min: 1,
        },
      ],
    },
  ],
}
