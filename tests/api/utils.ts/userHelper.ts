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
  const plainPassword = "Test123456"
  const hashedPassword = await bcrypt.hash(plainPassword, 10)

  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

  const user = await prisma.user.create({
    data: {
      name: `${role} Test`,
      email: `${role.toLowerCase()}-${unique}@test.com`,
      password: hashedPassword,
      role,
    },
  })

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  })

  return { user, plainPassword, token }
}

export function authHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getTokenByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  })

  if (!user) {
    throw new Error(`User not found for email: ${email}`)
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  })

  return {
    user,
    token,
  }
}