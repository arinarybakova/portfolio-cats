import { APIRequestContext, expect } from '@playwright/test';
import type { TestUser } from './testUser';
import type { Page } from '@playwright/test';
import { createTestUser } from './testUser';

const API_URL = process.env.API_URL ?? 'http://localhost:5000';

export async function registerUserViaApi(
  request: APIRequestContext,
  user: TestUser,
) {
  const response = await request.post(`${API_URL}/auth/register`, {
    data: user,
  });

  expect(response.ok()).toBeTruthy();

  return response;
}

export async function deleteUserViaApi(
  request: APIRequestContext,
  email: string,
) {
  await request.delete(`${API_URL}/test/users/${encodeURIComponent(email)}`);
}

export async function createAdminViaApi(
  request: APIRequestContext,
) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const admin: TestUser = {
    name: `E2E Admin ${id}`,
    email: `e2e-admin-${id}@test.com`,
    password: 'Password123!',
    role: 'ADMIN',
  };

  const registerResponse = await request.post(`${API_URL}/auth/register`, {
    data: admin,
  });

  expect(registerResponse.ok()).toBeTruthy();

  const loginResponse = await request.post(`${API_URL}/auth/login`, {
    data: {
      email: admin.email,
      password: admin.password,
      role: 'ADMIN',
    },
  });

  expect(loginResponse.ok()).toBeTruthy();

  const loginData = await loginResponse.json();

  return {
    admin,
    token: loginData.token,
    user: loginData.user,
  };
}

export async function loginUserViaApi(
  request: APIRequestContext,
  user: TestUser,
) {
  const response = await request.post(`${API_URL}/auth/login`, {
    data: {
      email: user.email,
      password: user.password,
      role: user.role,
    },
  });

  if (!response.ok()) {
    throw new Error(
      `Login failed: ${response.status()} ${await response.text()}`
    );
  }

  return response.json();
}

export async function getFirstBreedViaApi(
  request: APIRequestContext,
  token: string,
) {
  const response = await request.get(`${API_URL}/breeds`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  expect(response.ok()).toBeTruthy();

  const breeds = await response.json();
  expect(breeds.length).toBeGreaterThan(0);

  return breeds[0];
}

export async function createCatViaApi(
  request: APIRequestContext,
  token: string,
  cat: {
    name: string;
    age: number;
    status: string;
    breedId: number;
    image?: string;
  },
) {
  const response = await request.post(`${API_URL}/cats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: cat,
  });

  if (!response.ok()) {
    throw new Error(
      `Request failed: ${response.status()} ${await response.text()}`
    );
  }
  return response.json();
}

export async function createUserViaApi(request: APIRequestContext) {
  const user = createTestUser('USER');

  await registerUserViaApi(request, user);

  const loginData = await loginUserViaApi(request, user);

  return {
    user,
    id: loginData.user.id as number,
    name: loginData.user.name as string,
    token: loginData.token as string,
  };
}

export async function assignCatOwnerViaApi(
  request: APIRequestContext,
  token: string,
  catId: number,
  ownerId: number,
) {
  const response = await request.post(`${API_URL}/cats/${catId}/assign-owner`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      ownerId,
    },
  });

  expect(response.ok()).toBeTruthy();

  return response.json();
}

export async function getBreedsViaApi(
  request: APIRequestContext,
  token: string,
) {
  const response = await request.get(`${API_URL}/breeds`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  expect(response.ok()).toBeTruthy();

  return response.json();
}

export async function authenticateViaApi(
  page: Page,
  request: APIRequestContext,
  user: TestUser,
) {
  const loginData = await loginUserViaApi(
    request,
    user,
  );

  await page.goto('/');

  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem(
        'token',
        token,
      );

      localStorage.setItem(
        'user',
        JSON.stringify(user),
      );

      window.dispatchEvent(
        new Event('authChanged'),
      );
    },
    {
      token: loginData.token,
      user: loginData.user,
    },
  );

  await page.reload();

  return loginData;
}