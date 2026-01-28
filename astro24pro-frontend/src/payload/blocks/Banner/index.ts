import type { Block } from 'payload'

export const BannerBlock: Block = {
  slug: 'banner', // Уникальный ID блока
  labels: {
    singular: 'Рекламный баннер',
    plural: 'Рекламные баннеры',
  },
  fields: [
    {
      name: 'style',
      label: 'Стиль баннера',
      type: 'select',
      defaultValue: 'strip',
      options: [
        { label: 'Тонкая полоса (Акция)', value: 'strip' },
        { label: 'Большая карточка (Промо)', value: 'card' },
      ],
      required: true,
    },
    {
      name: 'content',
      label: 'Текст баннера',
      type: 'textarea', // Или richText, если нужно форматирование
      required: true,
    },
    {
      name: 'link',
      label: 'Ссылка (куда ведет клик)',
      type: 'text',
    },
    {
      name: 'buttonText',
      label: 'Текст кнопки (только для большой карточки)',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData.style === 'card', // Показываем только если выбран стиль 'card'
      },
    },
  ],
}
