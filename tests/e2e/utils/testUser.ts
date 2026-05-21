export type UserRole = 'USER' | 'ADMIN';

export type TestUser = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export function createTestUser(role: UserRole = 'USER'): TestUser {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return {
    name: `E2E ${role} ${id}`,
    email: `e2e-${role.toLowerCase()}-${id}@test.com`,
    password: 'Password123!',
    role,
  };
}