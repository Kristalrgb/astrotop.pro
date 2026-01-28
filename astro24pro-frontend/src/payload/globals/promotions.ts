import type { GlobalConfig } from 'payload'

export const Promotions: GlobalConfig = {
  slug: 'promotions',
  label: 'Рекламные баннеры',
  access: {
    read: () => true,
  },
  fields: [
    // --- Слот 1: Баннер под HeroSection (Тонкая полоска) ---
    {
      name: 'heroBanner',
      label: 'Баннер под HeroSection (Тонкая полоса)',
      type: 'group',
      fields: [
        {
          name: 'isActive',
          label: 'Показывать этот баннер?',
          type: 'checkbox',
          defaultValue: true,
        },
        // Добавляем фон (например, для текстуры космоса)
        {
          name: 'backgroundImage',
          label: 'Фоновое изображение (текстура)',
          type: 'upload',
          relationTo: 'media',
          required: false// Убедитесь, что ваша коллекция медиа называется 'media'
        },
        {
          name: 'content',
          label: 'Текст акции',
          type: 'text',
          required: true,
          defaultValue: 'Скидка 20% на первый расклад Таро',
        },
        {
          name: 'link',
          label: 'Ссылка',
          type: 'text',
        },
      ],
    },

    // --- Слот 2: Баннер Школы (Большая карточка) ---
    {
      name: 'schoolBanner',
      label: 'Баннер Школы (Большая карточка)',
      type: 'group',
      fields: [
        {
          name: 'isActive',
          label: 'Показывать баннер школы?',
          type: 'checkbox',
          defaultValue: true,
        },
        // Главное изображение
        {
          name: 'backgroundImage',
          label: 'Главное фоновое изображение',
          type: 'upload',
          relationTo: 'media',
          required: false, // Делаем обязательным, раз это "главное"
        },
        {
          name: 'title',
          label: 'Заголовок',
          type: 'text',
          defaultValue: 'Познай тайны Вселенной',
        },
        {
          name: 'buttonText',
          label: 'Текст кнопки',
          type: 'text',
          defaultValue: 'Начать обучение',
        },
        {
          name: 'link',
          label: 'Ссылка',
          type: 'text',
          defaultValue: '/school',
        },
      ],
    },
  ],
}
