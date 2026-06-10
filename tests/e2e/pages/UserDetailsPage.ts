import { expect, type Page } from '@playwright/test';
import type { UserData } from './UsersPage';

export class UserDetailsPage {
  constructor(private readonly page: Page) {}

  async goto(userId: number) {
    await this.page.goto(`/users/${userId}`);
    await expect(this.page.getByText('User Details')).toBeVisible();
    await expect(this.page.locator('.page-title')).toBeVisible();
  }

  async expectUserProfile(user: UserData) {
    await expect(this.page.locator('.page-title')).toHaveText(user.name);
    await expect(this.page.locator('.user-name')).toHaveText(user.name);
    await expect(this.page.locator('.role-pill')).toContainText(user.role);
    await expect(
      this.page.locator('.stat-card').filter({ hasText: 'Email' }),
    ).toContainText(user.email);
  }

  async fillUserInfo(updates: Partial<UserData>) {
    if (updates.name !== undefined) {
      await this.page
        .locator('.field')
        .filter({ has: this.page.locator('label', { hasText: 'Name' }) })
        .locator('input')
        .fill(updates.name);
    }

    if (updates.email !== undefined) {
      await this.page
        .locator('.field')
        .filter({ has: this.page.locator('label', { hasText: 'Email' }) })
        .locator('input')
        .fill(updates.email);
    }

    if (updates.role !== undefined) {
      await this.page
        .locator('.field')
        .filter({ has: this.page.locator('label', { hasText: 'Role' }) })
        .locator('select')
        .selectOption(updates.role);
    }
  }

  async saveUserInfo(userId: number) {
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.request().method() === 'PUT' &&
          response.url().includes(`/users/${userId}`) &&
          response.ok(),
      ),
      this.page.getByRole('button', { name: /save user info/i }).click(),
    ]);

    await expect(
      this.page.getByText('User info updated successfully.'),
    ).toBeVisible();
  }
}
