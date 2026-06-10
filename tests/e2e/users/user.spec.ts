import { test, expect } from '../fixtures/test';
import { UsersPage } from '../pages/UsersPage';
import { UserDetailsPage } from '../pages/UserDetailsPage';
import {
  authenticateViaApi,
  authenticateExistingUserViaApi,
  createAdminViaApi,
  createUserViaApi,
  ensureCatUnassignedViaApi,
  getExistingUserSessionViaApi,
} from '../utils/helperApi';
import {
  existingAdmin,
  existingAssignUser,
  existingCat,
} from '../utils/existingTestData';

test.describe('User management', () => {
  test('admin can create and delete a user', async ({ page, request }) => {
    const admin = await createAdminViaApi(request);
    const user = {
      name: `E2E User ${Date.now()}`,
      email: `e2e-user-${Date.now()}@test.com`,
      role: 'USER' as const,
    };

    await authenticateViaApi(page, request, admin.admin);

    const usersPage = new UsersPage(page);
    await usersPage.goto();

    await usersPage.createUser(user);
    await usersPage.expectUserInTable(user);

    await usersPage.deleteUser(user.email);
    await usersPage.expectUserNotInTable(user.email);
  });

  test('admin can edit a user in the table and verify changes', async ({
    page,
    request,
  }) => {
    const admin = await createAdminViaApi(request);
    const seed = await createUserViaApi(request);

    const original = {
      name: seed.name,
      email: seed.user.email,
      role: 'USER' as const,
    };

    const updated = {
      name: `E2E Table Updated ${Date.now()}`,
      email: `e2e-table-updated-${Date.now()}@test.com`,
      role: 'ADMIN' as const,
    };

    await authenticateViaApi(page, request, admin.admin);

    const usersPage = new UsersPage(page);
    await usersPage.goto();

    await usersPage.expectUserInTable(original);
    await usersPage.editUserInTable(original.email, seed.id, updated);
    await usersPage.expectUserNotInTable(original.email);
    await usersPage.expectUserInTable(updated);
  });

  test('admin can edit a user on the details page and verify changes', async ({
    page,
    request,
  }) => {
    const admin = await createAdminViaApi(request);
    const seed = await createUserViaApi(request);

    const original = {
      name: seed.name,
      email: seed.user.email,
      role: 'USER' as const,
    };

    const updated = {
      name: `E2E View Updated ${Date.now()}`,
      email: `e2e-view-updated-${Date.now()}@test.com`,
      role: 'ADMIN' as const,
    };

    await authenticateViaApi(page, request, admin.admin);

    const usersPage = new UsersPage(page);
    const userDetailsPage = new UserDetailsPage(page);

    await usersPage.goto();
    await usersPage.openUserDetails(original.email);
    await expect(page).toHaveURL(new RegExp(`/users/${seed.id}$`));

    await userDetailsPage.expectUserProfile(original);

    await userDetailsPage.fillUserInfo(updated);
    await userDetailsPage.saveUserInfo(seed.id);
    await userDetailsPage.expectUserProfile(updated);

    await page.goto('/users');
    await usersPage.expectUserNotInTable(original.email);
    await usersPage.expectUserInTable(updated);
  });

  test('admin can assign and remove an existing cat on the user details page', async ({
    page,
    request,
  }) => {
    const adminSession = await getExistingUserSessionViaApi(
      request,
      existingAdmin,
    );

    await ensureCatUnassignedViaApi(
      request,
      adminSession.token,
      existingCat.id,
    );

    await authenticateExistingUserViaApi(page, request, existingAdmin);

    const usersPage = new UsersPage(page);
    const userDetailsPage = new UserDetailsPage(page);

    await usersPage.goto();
    await usersPage.openUserDetails(existingAssignUser.email);
    await expect(page).toHaveURL(
      new RegExp(`/users/${existingAssignUser.id}$`),
    );

    await userDetailsPage.openOwnedCatsTab();
    await userDetailsPage.selectAndAssignCat(existingCat, existingAssignUser.id);
    await userDetailsPage.verifyCatAssigned(existingCat.name);
    await userDetailsPage.removeCat(existingCat.name);
    await userDetailsPage.verifyCatRemoved(existingCat.name);
  });
});
