import jwt, { type SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "test-secret";

type TokenPayload = {
  id: number;
  email: string;
  role: string;
};

export function generateToken(
  payload: TokenPayload,
  expiresIn: SignOptions["expiresIn"] = "1h"
) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function generateExpiredToken(payload: TokenPayload) {
  return generateToken(payload, -1); // expired 1 second ago
}