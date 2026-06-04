import { expect, type Page } from '@playwright/test';

export class CatDetailsPage {
  constructor(private readonly page: Page) {}

  async expectCatDetails(data: {
    name: string;
    age: number;
    status: 'AVAILABLE' | 'ADOPTED' | 'PENDING';
    priority: boolean;
    breedName?: string;
  }) {
    const nameHeading = this.page.locator('.cat-name');

    if (data.priority) {
      await expect(nameHeading.getByText('👑')).toBeVisible();
    } else {
      await expect(nameHeading.getByText('👑')).toBeHidden();
    }

    await expect(nameHeading).toContainText(data.name);
    await expect(
      this.page.locator(`.status-pill.status-${data.status}`),
    ).toBeVisible();
    await expect(
      this.page.locator('.info-card').filter({ hasText: 'Age' }),
    ).toContainText(String(data.age));
    await expect(
      this.page.locator('.info-card').filter({ hasText: 'Priority' }),
    ).toContainText(data.priority ? 'Yes' : 'No');

    if (data.breedName) {
      await expect(
        this.page.locator('.info-card').filter({ hasText: 'Breed' }),
      ).toContainText(data.breedName);
    }
  }

  async openEdit() {
    await this.page.getByRole('button', { name: /edit/i }).click();
    await expect(
      this.page.getByRole('button', { name: /save changes/i }),
    ).toBeVisible();
  }

  editPriorityCheckbox() {
    return this.page.locator('.check-row').getByRole('checkbox');
  }

  async fillEditForm(updates: {
    name?: string;
    age?: number;
    status?: 'AVAILABLE' | 'ADOPTED' | 'PENDING';
    priority?: boolean;
  }) {
    const stack = this.page.locator('.edit-stack');

    if (updates.name !== undefined) {
      await stack.locator('input').first().fill(updates.name);
    }

    if (updates.age !== undefined) {
      await stack.locator('input[type="number"]').fill(String(updates.age));
    }

    if (updates.status !== undefined) {
      await stack.locator('select').first().selectOption(updates.status);
    }

    if (updates.priority !== undefined) {
      const checkbox = this.editPriorityCheckbox();

      if (updates.priority) {
        await checkbox.check();
      } else {
        await checkbox.uncheck();
      }
    }
  }

  async waitForCatUpdate(catId: number) {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'PUT' &&
        res.url().includes(`/cats/${catId}`) &&
        res.ok(),
    );
  }

  async saveChanges(catId: number) {
    await Promise.all([
      this.waitForCatUpdate(catId),
      this.page.getByRole('button', { name: /save changes/i }).click(),
    ]);

    await expect(
      this.page.getByRole('button', { name: /save changes/i }),
    ).toBeHidden();
  }
}
