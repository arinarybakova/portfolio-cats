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

  async filterByBreed(breedId: number) {
    await this.breedFilter.selectOption(String(breedId));
    await this.searchButton.click();
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
    await this.minAgeSlider.focus();

    for (let i = 0; i < steps; i++) {
      await this.page.keyboard.press('ArrowRight');
    }
  }

  async setMaxAgeByKeyboard(steps: number) {
    await this.maxAgeSlider.focus();

    for (let i = 0; i < steps; i++) {
      await this.page.keyboard.press('ArrowLeft');
    }
  }

  async applyFilters() {
    await this.searchButton.click();
  }
}