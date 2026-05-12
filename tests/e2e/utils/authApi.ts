import { APIRequestContext, expect } from '@playwright/test';
import type { TestUser } from './testUser';

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