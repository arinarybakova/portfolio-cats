import { test, expect } from '../fixtures/test';
import { CatsPage } from '../pages/CatsPage';
import { CatDetailsPage } from '../pages/CatDetailsPage';
import {
  authenticateViaApi,
  createAdminViaApi,
  createCatViaApi,
  getFirstBreedViaApi,
} from '../utils/helperApi';

test.describe('Cat details', () => {
  test('admin can create cat via UI, add priority, and see it in table', async ({
    page,
    request,
  }) => {
    const adminData = await createAdminViaApi(request);
    const breed = await getFirstBreedViaApi(request, adminData.token);

    const catName = `E2E UI Cat ${Date.now()}`;

    await authenticateViaApi(page, request, adminData.admin);

    const catsPage = new CatsPage(page);
    await catsPage.goto();

    const createdCat = await catsPage.createCatViaUI({
      name: catName,
      age: 4,
      breedId: breed.id,
      status: 'AVAILABLE',
    });

    await catsPage.expectCatVisible(catName);
    await catsPage.expectCatRowDetails(catName, {
      age: 4,
      status: 'AVAILABLE',
      breedName: breed.name,
    });
    await catsPage.expectPriorityHiddenInTable(catName);

    await catsPage.setPriorityViaEditModal(catName, createdCat.id, true);
    await catsPage.expectPriorityVisibleInTable(catName);
  });

  test('admin can edit cat data and priority on details page', async ({
    page,
    request,
  }) => {
    const adminData = await createAdminViaApi(request);
    const breed = await getFirstBreedViaApi(request, adminData.token);

    const originalName = `E2E Details Original ${Date.now()}`;
    const updatedName = `E2E Details Updated ${Date.now()}`;

    const cat = await createCatViaApi(request, adminData.token, {
      name: originalName,
      age: 2,
      status: 'AVAILABLE',
      breedId: breed.id,
    });

    await authenticateViaApi(page, request, adminData.admin);

    const catsPage = new CatsPage(page);
    const catDetailsPage = new CatDetailsPage(page);

    await catsPage.goto();
    await catsPage.openCatDetails(originalName);
    await expect(page).toHaveURL(new RegExp(`/cats/${cat.id}$`));

    await catDetailsPage.expectCatDetails({
      name: originalName,
      age: 2,
      status: 'AVAILABLE',
      priority: false,
      breedName: breed.name,
    });

    await catDetailsPage.openEdit();
    await catDetailsPage.fillEditForm({
      name: updatedName,
      age: 5,
      status: 'PENDING',
      priority: true,
    });
    await catDetailsPage.saveChanges(cat.id);

    await catDetailsPage.expectCatDetails({
      name: updatedName,
      age: 5,
      status: 'PENDING',
      priority: true,
      breedName: breed.name,
    });

    await page.goto('/cats');
    await catsPage.expectCatVisible(updatedName);
    await catsPage.expectCatRowDetails(updatedName, {
      age: 5,
      status: 'PENDING',
      breedName: breed.name,
    });
    await catsPage.expectPriorityVisibleInTable(updatedName);
  });

  test('admin can edit cat via list modal and validate changes on details page', async ({
    page,
    request,
  }) => {
    const adminData = await createAdminViaApi(request);
    const breed = await getFirstBreedViaApi(request, adminData.token);

    const originalName = `E2E Modal Original ${Date.now()}`;
    const updatedName = `E2E Modal Updated ${Date.now()}`;

    const cat = await createCatViaApi(request, adminData.token, {
      name: originalName,
      age: 3,
      status: 'AVAILABLE',
      breedId: breed.id,
    });

    await authenticateViaApi(page, request, adminData.admin);

    const catsPage = new CatsPage(page);
    const catDetailsPage = new CatDetailsPage(page);

    await catsPage.goto();
    await catsPage.expectCatVisible(originalName);

    if (await catsPage.hasPriorityInTable(originalName)) {
      await catsPage.setPriorityViaEditModal(originalName, cat.id, false);
      await catsPage.expectPriorityHiddenInTable(originalName);
    }

    await catsPage.updateCatViaEditModal(originalName, cat.id, {
      name: updatedName,
      age: 7,
      status: 'ADOPTED',
      priority: true,
    });

    await catsPage.expectCatVisible(updatedName);
    await catsPage.expectCatRowDetails(updatedName, {
      age: 7,
      status: 'ADOPTED',
      breedName: breed.name,
    });
    await catsPage.expectPriorityVisibleInTable(updatedName);

    await catsPage.openCatDetails(updatedName);
    await expect(page).toHaveURL(new RegExp(`/cats/${cat.id}$`));

    await catDetailsPage.expectCatDetails({
      name: updatedName,
      age: 7,
      status: 'ADOPTED',
      priority: true,
      breedName: breed.name,
    });

    await page.goto('/cats');
    await catsPage.expectPriorityVisibleInTable(updatedName);
  });
});
