export const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  SPECIALIST: 'specialist',
  CLIENT: 'client',
}

export const PRODUCT_STATUS = {
  DRAFT: 'draft', // Черновик (видит только специалист)
  PENDING: 'pending', // На модерации (видит специалист и модератор)
  PUBLISHED: 'published', // Опубликован (видят все)
}
