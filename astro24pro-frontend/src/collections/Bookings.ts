import type { CollectionConfig } from 'payload'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    {
      name: 'client_id',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'client_name',
      type: 'text',
      required: true,
    },
    {
      name: 'client_email',
      type: 'email',
      required: true,
    },
    {
      name: 'client_phone',
      type: 'text',
      required: true,
    },
    {
      name: 'specialist_id',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'specialist_name',
      type: 'text',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'time',
      type: 'text',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Ожидает', value: 'pending' },
        { label: 'Подтверждено', value: 'confirmed' },
        { label: 'Отменено', value: 'cancelled' },
      ],
    },
    {
      name: 'reminder_sent',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'reminder_sent_at',
      type: 'date',
    },
  ],
}

