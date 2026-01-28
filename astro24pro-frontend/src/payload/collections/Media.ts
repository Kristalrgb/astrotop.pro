import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media',
    // --- ГЕНЕРАЦИЯ РАЗМЕРОВ ---
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'mobile', // Для телефонов
        width: 768,
        height: undefined,
        position: 'centre',
      },
      {
        name: 'tablet', // Для планшетов
        width: 1024,
        height: undefined,
        position: 'centre',
      },
      {
        name: 'desktop', // Для ноутбуков
        width: 1920,
        height: undefined,
        position: 'centre',
      },
    ],
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}
