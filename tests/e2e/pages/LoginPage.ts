import { expect, type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  emailInput = () => this.page.getByTestId('login-email');
  passwordInput = () => this.page.getByTestId('login-password');
  submitButton = () => this.page.getByTestId('login-submit');
  errorMessage = () => this.page.getByTestId('login-error');

  async open() {
    await this.page.goto('/login');
    await expect(this.emailInput()).toBeVisible({ timeout: 10_000 });
    await expect(this.passwordInput()).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.submitButton().click();
  }

  async expectErrorMessage(message: string) {
    await expect(this.errorMessage()).toBeVisible({ timeout: 10_000 });
    await expect(this.errorMessage()).toHaveText(message);
  }
}