import { expect, type Locator, type Page } from '@playwright/test';

export type UserRole = 'USER' | 'ADMIN';

export type UserData = {
  name: string;
  email: string;
  role: UserRole;
};

export class UsersPage {
  readonly page: Page;
  readonly title: Locator;
  readonly table: Locator;

  private readonly nameInput: Locator;
  private readonly emailInput: Locator;
  private readonly roleSelect: Locator;
  private readonly addUserButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.title = page.getByRole('heading', { name: 'Users List' });
    this.table = page.locator('.users-table');

    this.nameInput = page.getByPlaceholder('Full name');
    this.emailInput = page.getByPlaceholder('Email');
    this.roleSelect = page.locator('.form-grid select');
    this.addUserButton = page.getByRole('button', { name: /add user/i });
  }

  async goto() {
    await this.page.goto('/users');
    await expect(this.title).toBeVisible();
    await expect(this.table).toBeVisible();
  }

  async createUser(user: UserData) {
    await this.nameInput.fill(user.name);
    await this.emailInput.fill(user.email);
    await this.roleSelect.selectOption(user.role);

    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.request().method() === 'POST' &&
          response.url().includes('/users') &&
          response.ok(),
      ),
      this.addUserButton.click(),
    ]);
  }

  async expectUserInTable(user: UserData) {
    const row = this.rowForEmail(user.email);

    await expect(row).toBeVisible();
    await expect(row).toContainText(user.name);
    await expect(row).toContainText(user.email);
    await expect(row).toContainText(user.role);
  }

  async expectUserNotInTable(email: string) {
    await expect(this.rowForEmail(email)).toHaveCount(0);
  }

  async deleteUser(email: string) {
    this.page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Delete this user?');
      await dialog.accept();
    });

    const row = this.rowForEmail(email);
    await expect(row).toBeVisible();

    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.request().method() === 'DELETE' &&
          /\/users\/\d+$/.test(response.url()) &&
          response.ok(),
      ),
      row.getByRole('button', { name: /delete/i }).click(),
    ]);
  }

  async editUserInTable(
    currentEmail: string,
    userId: number,
    updates: Partial<UserData>,
  ) {
    await this.openEditModalForUser(currentEmail);

    const modal = this.editModalBody();

    if (updates.name !== undefined) {
      await modal.locator('input').first().fill(updates.name);
    }

    if (updates.email !== undefined) {
      await modal.locator('input[type="email"]').fill(updates.email);
    }

    if (updates.role !== undefined) {
      await modal.locator('select').selectOption(updates.role);
    }

    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.request().method() === 'PUT' &&
          response.url().includes(`/users/${userId}`) &&
          response.ok(),
      ),
      modal.getByRole('button', { name: /^save$/i }).click(),
    ]);

    await expect(this.page.getByRole('heading', { name: 'Edit User' })).toBeHidden();
  }

  async openUserDetails(email: string) {
    await this.rowForEmail(email).locator('.name-link').click();
  }

  private async openEditModalForUser(email: string) {
    const row = this.rowForEmail(email);
    await row.getByRole('button', { name: /^edit$/i }).click();
    await expect(this.page.getByRole('heading', { name: 'Edit User' })).toBeVisible();
  }

  private editModalBody() {
    return this.page.locator('.modal-body');
  }

  private rowForEmail(email: string) {
    return this.table.locator('tbody tr').filter({ hasText: email });
  }
}
