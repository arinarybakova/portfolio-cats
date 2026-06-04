import { expect, type Locator, type Page } from '@playwright/test';

export class CatsPage {
  readonly page: Page;

  readonly title: Locator;
  readonly table: Locator;
  readonly searchInput: Locator;
  readonly breedFilter: Locator;
  readonly statusFilter: Locator;
  readonly fromDateFilter: Locator;
  readonly toDateFilter: Locator;
  readonly minAgeSlider: Locator;
  readonly maxAgeSlider: Locator;
  readonly searchButton: Locator;
  readonly clearButton: Locator;
  readonly addCatButton: Locator;
  readonly catNameInput: Locator;
  readonly catAgeInput: Locator;
  readonly catBreedSelect: Locator;
  readonly catStatusSelect: Locator;
  readonly saveCatButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.title = page.getByText(/Owned Cats|Cats Collection/);
    this.table = page.locator('.cats-table');

    this.searchInput = page.getByTestId('search-input');
    this.breedFilter = page.getByTestId('breed-filter');
    this.statusFilter = page.getByTestId('status-filter');
    this.fromDateFilter = page.getByTestId('from-date-filter');
    this.toDateFilter = page.getByTestId('to-date-filter');
    this.minAgeSlider = page.getByTestId('min-age-slider').locator('[role="slider"]');
    this.maxAgeSlider = page.getByTestId('max-age-slider').locator('[role="slider"]');
    this.searchButton = page.getByTestId('search-button');
    this.clearButton = page.getByTestId('clear-button');

    this.addCatButton = page.getByRole('button', {
      name: /add cat/i,
    });

    this.catNameInput = page.locator(
      '.modal-body input[placeholder="Name"]',
    );

    this.catAgeInput = page.locator(
      '.modal-body input[placeholder="Age"]',
    );

    this.catBreedSelect = page.locator(
      '.modal-body select',
    ).nth(0);

    this.catStatusSelect = page.locator(
      '.modal-body select',
    ).nth(1);

    this.saveCatButton = page.getByRole('button', {
      name: /^save$/i,
    });
  }

  async goto() {
    await this.page.goto('/cats');
    await expect(this.title).toBeVisible();
    await expect(this.table).toBeVisible();
  }

  catRow(name: string) {
    return this.table.locator('tbody tr').filter({
      hasText: name,
    });
  }

  async search(value: string) {
    await this.searchInput.fill(value);
    await this.searchButton.click();
  }

  async filterByBreedId(breedId: string) {
    const select = this.page.getByTestId('breed-filter');

    await select.waitFor({ state: 'visible' });

    await select.selectOption(breedId);

    await Promise.all([
      this.page.waitForResponse((res) =>
        res.url().includes('/cats') &&
        res.request().method() === 'GET'
      ),
      this.searchButton.click(),
    ]);
  }

  async filterByStatus(status: 'AVAILABLE' | 'ADOPTED' | 'PENDING') {
    await this.statusFilter.selectOption(status);
    await this.searchButton.click();
  }

  async filterByDateRange(from: string, to: string) {
    await this.fromDateFilter.fill(from);
    await this.toDateFilter.fill(to);
    await this.searchButton.click();
  }

  async clearFilters() {
    await this.clearButton.click();
    await this.searchButton.click();
  }

  async expectCatVisible(name: string) {
    await expect(this.catRow(name)).toBeVisible();
  }

  async expectCatHidden(name: string) {
    await expect(this.catRow(name)).toHaveCount(0);
  }

  async expectOnlyCatsVisible(visible: string[], hidden: string[]) {
    for (const name of visible) {
      await this.expectCatVisible(name);
    }

    for (const name of hidden) {
      await this.expectCatHidden(name);
    }
  }

 async setMinAgeByKeyboard(steps: number) {
  const slider = this.page.getByTestId('min-age-slider');

  await slider.waitFor({ state: 'visible' });
  await slider.click();

  for (let i = 0; i < steps; i++) {
    await this.page.keyboard.press('ArrowRight');
  }
}

async setMaxAgeByKeyboard(steps: number) {
  const slider = this.page.getByTestId('max-age-slider');

  await slider.waitFor({ state: 'visible' });
  await slider.click();

  for (let i = 0; i < steps; i++) {
    await this.page.keyboard.press('ArrowLeft');
  }
}

  async applyFilters() {
    await this.searchButton.click();
  }

  async deleteCatByName(name: string) {
    const row = this.page.locator('tr', {
      hasText: name,
    });

    await expect(row).toBeVisible();

    await row.getByRole('button', {
      name: /delete/i,
    }).click();
  }

  editModalBody() {
    return this.page.locator('.modal-body');
  }

  editModalPriorityCheckbox() {
    return this.editModalBody()
      .locator('label')
      .filter({ hasText: 'Priority' })
      .getByRole('checkbox');
  }

  async openEditModalForCat(name: string) {
    const row = this.catRow(name);
    await row.getByRole('button', { name: /edit/i }).click();
    await expect(this.page.getByRole('heading', { name: 'Edit Cat' })).toBeVisible();
  }

  async waitForCatCreate() {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'POST' &&
        /\/cats\/?(\?|$)/.test(res.url()) &&
        res.ok(),
    );
  }

  async waitForCatUpdate(catId: number) {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'PUT' &&
        res.url().includes(`/cats/${catId}`) &&
        res.ok(),
    );
  }

  async createCatViaUI(data: {
    name: string;
    age: number;
    breedId: number;
    status: 'AVAILABLE' | 'ADOPTED' | 'PENDING';
  }) {
    await this.addCatButton.click();
    await expect(this.page.getByRole('heading', { name: 'Add Cat' })).toBeVisible();

    await this.catNameInput.fill(data.name);
    await this.catAgeInput.fill(String(data.age));
    await this.catBreedSelect.selectOption(String(data.breedId));
    await this.catStatusSelect.selectOption(data.status);

    const [response] = await Promise.all([
      this.waitForCatCreate(),
      this.saveCatButton.click(),
    ]);

    await expect(this.page.getByRole('heading', { name: 'Add Cat' })).toBeHidden();

    return response.json() as Promise<{ id: number; name: string }>;
  }

  async updateCatViaEditModal(
    name: string,
    catId: number,
    updates: {
      name?: string;
      age?: number;
      status?: 'AVAILABLE' | 'ADOPTED' | 'PENDING';
      priority?: boolean;
    },
  ) {
    await this.openEditModalForCat(name);

    const modal = this.editModalBody();

    if (updates.name !== undefined) {
      await modal.locator('input').first().fill(updates.name);
    }

    if (updates.age !== undefined) {
      await modal.locator('input[type="number"]').fill(String(updates.age));
    }

    if (updates.status !== undefined) {
      await modal.locator('select').first().selectOption(updates.status);
    }

    if (updates.priority !== undefined) {
      const checkbox = this.editModalPriorityCheckbox();

      if (updates.priority) {
        await checkbox.check();
      } else {
        await checkbox.uncheck();
      }
    }

    await Promise.all([
      this.waitForCatUpdate(catId),
      this.page.getByRole('button', { name: /^update$/i }).click(),
    ]);

    await expect(this.page.getByRole('heading', { name: 'Edit Cat' })).toBeHidden();
  }

  async setPriorityViaEditModal(
    name: string,
    catId: number,
    priority: boolean,
  ) {
    await this.updateCatViaEditModal(name, catId, { priority });
  }

  async expectCatRowDetails(
    name: string,
    data: {
      age: number;
      status: 'AVAILABLE' | 'ADOPTED' | 'PENDING';
      breedName?: string;
    },
  ) {
    const row = this.catRow(name);

    await expect(row).toContainText(String(data.age));
    await expect(row.locator(`.status-pill.status-${data.status}`)).toBeVisible();

    if (data.breedName) {
      await expect(row).toContainText(data.breedName);
    }
  }

  async hasPriorityInTable(name: string) {
    const row = this.catRow(name);
    await expect(row).toBeVisible();

    const hasPriorityRowClass = await row.evaluate((el) =>
      el.classList.contains('priority-row'),
    );
    const crownVisible = await row.getByText('👑').isVisible();

    return hasPriorityRowClass || crownVisible;
  }

  async expectPriorityVisibleInTable(name: string) {
    const row = this.catRow(name);
    await expect(row).toHaveClass(/priority-row/);
    await expect(row.getByText('👑')).toBeVisible();
  }

  async expectPriorityHiddenInTable(name: string) {
    const row = this.catRow(name);
    await expect(row).not.toHaveClass(/priority-row/);
    await expect(row.getByText('👑')).toBeHidden();
  }

  async openCatDetails(name: string) {
    await this.catRow(name).locator('.name-link').click();
  }
}