import { test, expect } from '../fixtures/test';
import { CatsPage } from '../pages/CatsPage';

import {
    registerUserViaApi,
    loginUserViaApi,
    getBreedsViaApi,
    createCatViaApi,
    assignCatOwnerViaApi,
    authenticateViaApi,
} from '../utils/helperApi';

import { createTestUser } from '../utils/testUser';
import { createTestCats } from '../utils/catTestData';

function dateInput(date: Date) {
    return date.toISOString().slice(0, 10);
}

test('logged-in user can search and filter own cats', async ({
    page,
    request,
    testUser,
}) => {

    await registerUserViaApi(request, testUser);

    const adminUser = createTestUser('ADMIN');
    await registerUserViaApi(request, adminUser);

    const userLogin = await loginUserViaApi(request, testUser);
    const adminLogin = await loginUserViaApi(request, adminUser);

    const breeds = await getBreedsViaApi(request, adminLogin.token);
    expect(breeds.length).toBeGreaterThanOrEqual(2);

    const [breedA, breedB] = breeds;

    const cats = createTestCats(breedA.id, breedB.id);

    for (const cat of cats) {
        const createdCat = await createCatViaApi(
            request,
            adminLogin.token,
            cat
        );

        await assignCatOwnerViaApi(
            request,
            adminLogin.token,
            createdCat.id,
            userLogin.user.id
        );
    }

    await authenticateViaApi(page, request, testUser);

    const catsPage = new CatsPage(page);
    await catsPage.goto();

    await page.waitForLoadState('networkidle');

    await catsPage.search(cats[0].name);
    await expect(page.getByText(cats[0].name)).toBeVisible();

    await catsPage.clearFilters();

    await catsPage.filterByStatus('ADOPTED');

    await catsPage.expectOnlyCatsVisible(
        [cats[0].name, cats[1].name, cats[2].name],
        []
    );

    await catsPage.clearFilters();

    await catsPage.filterByBreedId(String(breedA.id));

    await expect(page.getByText(cats[0].name)).toBeVisible();

    await catsPage.clearFilters();

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    await catsPage.searchInput.fill('Cat');

    await catsPage.filterByDateRange(
        dateInput(today),
        dateInput(tomorrow)
    );

    await catsPage.clearFilters();

    await catsPage.searchInput.fill(cats[0].name);

    await catsPage.statusFilter.selectOption('ADOPTED');
    await catsPage.breedFilter.selectOption(String(breedA.id));

    await catsPage.fromDateFilter.fill(dateInput(today));
    await catsPage.toDateFilter.fill(dateInput(tomorrow));

    await catsPage.applyFilters();

    await expect(page.getByText(cats[0].name)).toBeVisible();

    await catsPage.clearFilters();

    await catsPage.setMinAgeByKeyboard(3);
    await catsPage.setMaxAgeByKeyboard(5);

    await catsPage.applyFilters();

    await expect(page.getByText(cats[1].name)).toBeVisible();
});