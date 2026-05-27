import { test, expect } from '../fixtures/test';

import { CatsPage } from '../pages/CatsPage';
import {
  authenticateViaApi,
} from '../utils/helperApi';

import {
  createAdminViaApi,
  getFirstBreedViaApi,
} from '../utils/helperApi';

test('admin can create and delete cat', async ({
  page,
  request,
}) => {
  // create admin
  const adminData = await createAdminViaApi(request);

  // get breed
  const breed = await getFirstBreedViaApi(
    request,
    adminData.token,
  );

  // unique cat name
  const catName = `E2E Cat ${Date.now()}`;

  await authenticateViaApi(
  page,
  request,
  adminData.admin,
);

  // open cats page
  const catsPage = new CatsPage(page);

  await catsPage.goto();

  // open create modal
  await catsPage.addCatButton.click();

  // fill form
  await catsPage.catNameInput.fill(catName);

  await catsPage.catAgeInput.fill('4');

  await catsPage.catBreedSelect.selectOption(
    String(breed.id),
  );

  await catsPage.catStatusSelect.selectOption(
    'AVAILABLE',
  );

  // save cat
  await catsPage.saveCatButton.click();

  // verify created
  await expect(
    page.getByText(catName),
  ).toBeVisible();

  // delete cat
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain(
      'Delete this cat?',
    );

    await dialog.accept();
  });

  await catsPage.deleteCatByName(catName);

  // verify deleted
  await expect(
  page.locator('tr', { hasText: catName }),
).toHaveCount(0);
});