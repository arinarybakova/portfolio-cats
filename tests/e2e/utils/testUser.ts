export type TestUser = {
  name: string;
  email: string;
  password: string;
};

export function createTestUser(): TestUser {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return {
    name: `E2E User ${id}`,
    email: `e2e-${id}@test.com`,
    password: 'Password123!',
  };
}