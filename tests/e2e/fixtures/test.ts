import { test as base } from '@playwright/test';
import { createTestUser, type TestUser } from '../utils/testUser';
import { deleteUserViaApi } from '../utils/authApi';

type Fixtures = {
  testUser: TestUser;
};

export const test = base.extend<Fixtures>({
  testUser: async ({ request }, use) => {
    const user = createTestUser();

    await use(user);

    await deleteUserViaApi(request, user.email).catch(() => {
      // Do not fail the test because cleanup failed.
      // But ideally log this in CI later.
    });
  },
});

export { expect } from '@playwright/test';