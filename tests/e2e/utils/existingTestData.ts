import type { TestUser } from './testUser';

/** Persistent admin in the local database (Adi). */
export const existingAdmin: TestUser = {
  name: 'Adi',
  email: 'user32@gmail.com',
  password: process.env.E2E_EXISTING_ADMIN_PASSWORD ?? '',
  role: 'ADMIN',
};

/** Persistent user in the local database (Ari). */
export const existingAssignUser = {
  id: 229,
  name: 'Ari',
  email: 'ari@example.com',
  role: 'USER' as const,
};

/** Persistent cat in the local database. */
export const existingCat = {
  id: 1,
  name: 'Kitty',
};
