import { expect, type Page } from '@playwright/test';
import type { TestUser } from '../utils/testUser';

export class RegisterPage {
  constructor(private readonly page: Page) {}

  nameInput = () => this.page.getByTestId('register-name');
  emailInput = () => this.page.getByTestId('register-email');
  passwordInput = () => this.page.getByTestId('register-password');
  submitButton = () => this.page.getByTestId('register-submit');
  errorMessage = () => this.page.getByTestId('register-error');

  async open() {
    await this.page.goto('/register');
    await expect(this.nameInput()).toBeVisible({ timeout: 10_000 });
    await expect(this.emailInput()).toBeVisible();
    await expect(this.passwordInput()).toBeVisible();
  }

  async register(user: TestUser) {
    await this.nameInput().fill(user.name);
    await this.emailInput().fill(user.email);
    await this.passwordInput().fill(user.password);
    await this.submitButton().click();
  }

  async submit() {
    await this.submitButton().click();
  }

  async expectErrorMessage(message: string) {
    await expect(this.errorMessage()).toBeVisible({ timeout: 10_000 });
    await expect(this.errorMessage()).toHaveText(message);
  }
}