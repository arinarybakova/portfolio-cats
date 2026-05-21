import { test, expect } from '../fixtures/test';
import { CatsPage } from '../pages/CatsPage';
import { LoginPage } from '../pages/LoginPage';

import {
    registerUserViaApi,
    loginUserViaApi,
    getBreedsViaApi,
    createCatViaApi,
    assignCatOwnerViaApi,
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
    // register normal test user
    await registerUserViaApi(request, testUser);

    // create + register admin
    const adminUser = createTestUser('ADMIN');

    await registerUserViaApi(request, adminUser);

    // login through API
    const userLogin = await loginUserViaApi(
        request,
        testUser,
    );

    const adminLogin = await loginUserViaApi(
        request,
        adminUser,
    );

    // get breeds
    const breeds = await getBreedsViaApi(
        request,
        adminLogin.token,
    );

    expect(breeds.length).toBeGreaterThanOrEqual(2);

    const [breedA, breedB] = breeds;

    // create test cats
    const cats = createTestCats(
        breedA.id,
        breedB.id,
    );

    // create + assign cats to normal user
    for (const cat of cats) {
        const createdCat = await createCatViaApi(
            request,
            adminLogin.token,
            cat,
        );

        await assignCatOwnerViaApi(
            request,
            adminLogin.token,
            createdCat.id,
            userLogin.user.id,
        );
    }

    // login via UI
    const loginPage = new LoginPage(page);

    await loginPage.goto();

    await loginPage.login(
        testUser.email,
        testUser.password,
    );

    // open cats page
    const catsPage = new CatsPage(page);

    await catsPage.goto();

    // search by name
    await catsPage.search('Alpha');

    await catsPage.expectOnlyCatsVisible(
        [cats[0].name],
        [cats[1].name, cats[2].name],
    );

    // clear
    await catsPage.clearFilters();

    // all assigned cats become ADOPTED
    await catsPage.filterByStatus('ADOPTED');

    await catsPage.expectOnlyCatsVisible(
        [cats[0].name, cats[1].name, cats[2].name],
        [],
    );

    // clear
    await catsPage.clearFilters();

    // breed filter
    await catsPage.filterByBreed(breedB.id);

    await catsPage.expectOnlyCatsVisible(
        [cats[1].name],
        [cats[0].name, cats[2].name],
    );

    // clear
    await catsPage.clearFilters();

    // date filter
    const today = new Date();
    const tomorrow = new Date();

    tomorrow.setDate(today.getDate() + 1);

    await catsPage.searchInput.fill('Search');

    await catsPage.filterByDateRange(
        dateInput(today),
        dateInput(tomorrow),
    );

    await catsPage.expectOnlyCatsVisible(
        [cats[0].name, cats[1].name],
        [cats[2].name],
    );

    // clear
    await catsPage.clearFilters();

    // combined filters
    await catsPage.searchInput.fill('Alpha');

    await catsPage.statusFilter.selectOption('ADOPTED');

    await catsPage.breedFilter.selectOption(
        String(breedA.id),
    );

    await catsPage.fromDateFilter.fill(
        dateInput(today),
    );

    await catsPage.toDateFilter.fill(
        dateInput(tomorrow),
    );

    await catsPage.applyFilters();

    await catsPage.expectOnlyCatsVisible(
        [cats[0].name],
        [cats[1].name, cats[2].name],
    );

    // clear
    await catsPage.clearFilters();

    // age sliders
    await catsPage.setMinAgeByKeyboard(4);

    await catsPage.setMaxAgeByKeyboard(3);

    await catsPage.applyFilters();

    await catsPage.expectOnlyCatsVisible(
        [cats[1].name],
        [cats[0].name, cats[2].name],
    );
});