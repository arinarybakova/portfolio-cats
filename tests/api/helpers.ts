// tests/api/helpers.ts
import { api } from "../http/client";

export async function registerUser(data?: Partial<{
  name: string;
  email: string;
  password: string;
  role: string;
}>) {
  const payload = {
    name: "Test User",
    email: `user-${Date.now()}-${Math.random()}@test.com`,
    password: "Secret123!",
    role: "USER",
    ...data,
  };

  const res = await api.post<any>("/auth/register", payload);
  return { res, payload };
}

export async function loginUser(data: {
  email: string;
  password: string;
  role?: string;
}) {
  const res = await api.post("/auth/login", data);
  return res;
}

export function authHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}