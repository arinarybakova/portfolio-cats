import { describe, it, expect } from "vitest"
import { api } from "../http/client.ts"
import { loginUser, registerUser, authHeader } from "./helpers.ts"

describe("Users - Delete", () => {
  it("rejects delete request without authentication", async () => {});
  it("rejects delete request with invalid token", async () => {});
  it("rejects delete request from a normal user", async () => {});
  it("allows an admin to delete another user", async () => {});
  it("returns success message when deletion is successful", async () => {});
  it("prevents deleted user from logging in again", async () => {});
  it("returns 500 if trying to delete a non-existing user", async () => {});
  it("handles non-numeric user id safely", async () => {});
});

describe("Users - Get by ID", () => {
  it("rejects request without authentication", async () => {});
  it("rejects request with invalid token", async () => {});
  it("allows a user to fetch their own profile", async () => {});
  it("rejects a normal user fetching another user's profile", async () => {});
  it("allows an admin to fetch any user's profile", async () => {});
  it("returns 404 when the requested user does not exist", async () => {});
  it("does not return the password field when fetching own profile", async () => {});
  it("does not return the password field when admin fetches another user", async () => {});
  it("returns the user's cats with breed data when profile is fetched", async () => {});
  it("handles non-numeric user id safely", async () => {});
});

describe("Users - Get All", () => {
  it("rejects request without authentication", async () => {});
  it("rejects request with invalid token", async () => {});
  it("rejects a normal user from fetching all users", async () => {});
  it("allows an admin to fetch all users", async () => {});
  it("does not return password fields in the users list", async () => {});
});