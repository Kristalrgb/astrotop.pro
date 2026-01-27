import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'client',
      options: [
        { label: 'Клиент', value: 'client' },
        { label: 'Астролог', value: 'astrologer' },
        { label: 'Администратор', value: 'admin' },
      ],
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'avatar',
      type: 'text',
      admin: {
        description: 'URL аватара пользователя',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'specialties',
      type: 'array',
      label: 'Специализации',
      fields: [
        {
          name: 'value',
          type: 'text',
        },
      ],
    },
    {
      name: 'rating',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'reviews_count',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
