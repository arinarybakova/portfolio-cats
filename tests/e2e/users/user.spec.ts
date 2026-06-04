import { test } from '../fixtures/test';
import { UsersPage } from '../pages/UsersPage';
import { authenticateViaApi, createAdminViaApi } from '../utils/helperApi';

test.describe('User management', () => {
  test('admin can create and delete a user', async ({ page, request }) => {
    const admin = await createAdminViaApi(request);
    const user = {
      name: `E2E User ${Date.now()}`,
      email: `e2e-user-${Date.now()}@test.com`,
      role: 'USER' as const,
    };

    await authenticateViaApi(page, request, admin.admin);

    const usersPage = new UsersPage(page);
    await usersPage.goto();

    await usersPage.createUser(user);
    await usersPage.expectUserInTable(user);

    await usersPage.deleteUser(user.email);
    await usersPage.expectUserNotInTable(user.email);
  });
});
