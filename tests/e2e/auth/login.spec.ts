import { test, expect } from '../fixtures/test';
import { LoginPage } from '../pages/LoginPage';
import { registerUserViaApi } from '../utils/authApi';

test.describe('Login', () => {
  test('registered user can login', async ({ page, request, testUser }) => {
    await registerUserViaApi(request, testUser);

    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login(testUser.email, testUser.password);

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