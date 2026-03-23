import { api } from "../../http/client";
import { prisma } from "../../../backend/prisma";
import { generateToken } from "../utils.ts/jwtHelper";
import bcrypt from "bcryptjs";

const password = "Secret123!";

export async function registerUser(
  data?: Partial<{
    name: string;
    email: string;
    password: string;
    role: string;
  }>
) {
  const payload = {
    name: "Test User",
    email: `user-${Date.now()}-${Math.random()}@test.com`,
    password: "Secret123!",
    role: "USER",
    ...data,
  };

  const res = await api.post("/auth/register", payload);
  return { res, payload };
}

export async function loginUser(data: {
  email: string;
  password: string;
  role?: string;
}) {
  return api.post("/auth/login", data);
}

export async function createUserAndToken(role: "USER" | "ADMIN") {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: `${role} Test`,
      email: `${role.toLowerCase()}-${Date.now()}@test.com`,
      password: hashedPassword,
      role,
    },
  });

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return { user, password, token };
}

export function authHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}