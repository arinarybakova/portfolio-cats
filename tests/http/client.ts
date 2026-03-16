// tests/http/client.ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.API_BASE_URL ?? "http://localhost:5000",
  timeout: 5000,
  validateStatus: () => true,
  headers: {
    "Content-Type": "application/json",
  },
});