import { test, expect } from '../fixtures/test';
import { LoginPage } from '../pages/LoginPage';
import { registerUserViaApi } from '../utils/helperApi';
import { createTestUser } from '../utils/testUser';

test.describe('Login', () => {
  test('registered user can login', async ({
    page,
    request,
  }) => {
    const adminUser = createTestUser('ADMIN');

    await registerUserViaApi(
      request,
      adminUser,
    );

    const loginPage = new LoginPage(page);

    await loginPage.open();

    await loginPage.clickAdminTab();

    await loginPage.login(
      adminUser.email,
      adminUser.password,
    );

    await expect(page).not.toHaveURL(/\/login/);
  });
  test('user cannot login with wrong password', async ({ page, request, testUser }) => {
    await registerUserViaApi(request, testUser);

    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login(testUser.email, 'WrongPassword123!');

    await loginPage.expectErrorMessage('Invalid email or password');
  });
});