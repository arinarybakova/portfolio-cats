import { test, expect } from '../fixtures/test';
import { RegisterPage } from '../pages/RegisterPage';

test.describe('Register', () => {
  test('user can register with valid data', async ({ page, testUser }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.open();
    await registerPage.register(testUser);

    await expect(page).not.toHaveURL(/\/register/);
  });

  test('user cannot register with empty form', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.open();
    await registerPage.submit();

    await registerPage.expectErrorMessage('Name, email and password are required');
  });
});