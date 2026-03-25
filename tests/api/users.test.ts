import { describe, it, expect } from "vitest";
import { api } from "../http/client";
import { loginUser, authHeader } from "./utils.ts/userHelper";
import { createUserAndToken } from "./utils.ts/userHelper";
import { generateExpiredToken, generateToken } from "./utils.ts/jwtHelper";

describe("Users - Delete", () => {
  it("rejects delete request without authentication", async () => {
    const res = await api.delete("/users/1");

    expect(res.status).toBe(401);
    expect(res.data).toEqual({ error: "Unauthorized" });
  });

  it("rejects delete request with invalid token", async () => {
    const res = await api.delete("/users/1", {
      headers: authHeader("invalid-token"),
    });

    expect(res.status).toBe(401);
    expect(res.data).toEqual({ error: "Invalid or expired token" });
  });

  it("rejects delete request from a role user", async () => {
    const { token: userToken } = await createUserAndToken("USER");
    const { user } = await createUserAndToken("USER");

    const res = await api.delete(`/users/${user.id}`, {
      headers: authHeader(userToken),
    });

    expect(res.status).toBe(403);
    expect(res.data).toEqual({ error: "Admin access required" });
  });

  it("allows an admin to delete another user and checks if user cannot login", async () => {
    const { token: adminToken } = await createUserAndToken("ADMIN");
    const { user, password } = await createUserAndToken("USER");

    const deleteRes = await api.delete(`/users/${user.id}`, {
      headers: authHeader(adminToken),
    });

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.data).toEqual({ message: "User deleted successfully" });

    const loginRes = await loginUser({
      email: user.email,
      password,
    });

    expect(loginRes.status).toBe(401);
    expect(loginRes.data).toEqual({
      error: "Invalid email or password",
    });
  });

  it("returns 500 if trying to delete a non-existing user", async () => {
    const { token: adminToken } = await createUserAndToken("ADMIN");

    const res = await api.delete("/users/1111111", {
      headers: authHeader(adminToken),
    });

    expect(res.status).toBe(500);
    expect(res.data).toEqual({ error: "Failed to delete user" });
  });

  it("handles non-numeric user id safely", async () => {
    const { token: adminToken } = await createUserAndToken("ADMIN");

    const res = await api.delete("/users/testTest", {
      headers: authHeader(adminToken),
    });

    expect(res.status).toBe(500);
    expect(res.data).toEqual({ error: "Failed to delete user" });
  });

  it("rejects delete request with expired token", async () => {
    const { user } = await createUserAndToken("ADMIN");

    const expiredToken = generateExpiredToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const res = await api.delete(`/users/${user.id}`, {
      headers: authHeader(expiredToken),
    });

    expect(res.status).toBe(401);
    expect(res.data).toEqual({ error: "Invalid or expired token" });
  });

});

describe('Users - Get by ID', () => {

  it('rejects request without authentication', async () => {
    const res = await api.get("/users/1")
    expect(res.status).toBe(401)
    expect(res.data).toEqual({ error: 'Unauthorized' })
  })

  it('rejects request with invalid token', async () => {
    const res = await api.get("/users/1", {
      headers: authHeader("invalid-token")
    })
    expect(res.status).toBe(401)
    expect(res.data).toEqual({ error: 'Invalid or expired token' })
  })

  it('allows a user to fetch their own profile', async () => {
    const { user, token } = await createUserAndToken("USER");
    const res = await api.get(`/users/${user.id}`, {
      headers: authHeader(token),
    })
    expect(res.status).toBe(200)
    expect(res.data).toMatchObject({
      email: user.email,
      name: user.name,
      id: user.id
    })
    expect(res.data).not.toHaveProperty('password')
    expect(res.data).toHaveProperty('cats')
  })

  it('rejects a user fetching another user profile', async () => {
    const { token } = await createUserAndToken("USER");
    const { user: otherUser } = await createUserAndToken("USER");
    const res = await api.get(`/users/${otherUser.id}`, {
      headers: authHeader(token),
    });
    expect(res.status).toBe(403)
    expect(res.data).toEqual({ error: 'Access denied' })
  })

  it('allows an admin to fetch any user profile', async () => {
    const { user: user } = await createUserAndToken("USER");
    const { token: adminToken } = await createUserAndToken("ADMIN");
    const res = await api.get(`/users/${user.id}`, {
      headers: authHeader(adminToken),
    });
    expect(res.status).toBe(200)
    expect(res.data).toMatchObject({
      email: user.email,
      name: user.name,
    });
    expect(res.data).not.toHaveProperty('password')
    expect(res.data).toHaveProperty('cats')
  })
})

it('returns 404 when the requested user does not exist', async () => {
  const res = await api.get("/users/111213133131", {
    headers: authHeader("invalid-token")
  })
  expect(res.status).toBe(401)
  expect(res.data).toEqual({ error: 'Invalid or expired token' })
})

it('handles non-numeric user id safely', async () => {
  const { token: adminToken } = await createUserAndToken("ADMIN");

  const res = await api.get("/users/testTest", {
    headers: authHeader(adminToken),
  });

  expect(res.status).toBe(500);
  expect(res.data).toEqual({ error: "Failed to fetch user" })
})

it("rejects expired token", async () => {
  const { user } = await createUserAndToken("USER");

  const expiredToken = generateExpiredToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const res = await api.get(`/users/${user.id}`, {
    headers: authHeader(expiredToken),
  });

  expect(res.status).toBe(401);
  expect(res.data).toEqual({ error: "Invalid or expired token" });
});

describe('Users - Get All', () => {

  it('rejects request without authentication', async () => {
    const res = await api.get('/users')
    expect(res.status).toBe(401)
    expect(res.data).toEqual({ error: 'Unauthorized' })
  });

  it('rejects request with invalid token', async () => {
    const res = await api.get('/users')
    expect(res.status).toBe(401)
    expect(res.data).toEqual({ error: 'Unauthorized' })
  });

  it("rejects request expired token", async () => {
    const { user } = await createUserAndToken('ADMIN');

    const expiredToken = generateExpiredToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const res = await api.get('/users', {
      headers: authHeader(expiredToken),
    });

    expect(res.status).toBe(401);
    expect(res.data).toEqual({ error: "Invalid or expired token" });
  });

  it('rejects a user from fetching all users', async () => {
    const { token: userToken } = await createUserAndToken("USER")
    const res = await api.get('/users', {
      headers: authHeader(userToken)
    })
    expect(res.status).toBe(403)
    expect(res.data).toEqual({ error: "Admin access required" })

  });
  it('allows an admin to fetch all users', async () => {
    const { token: adminToken } = await createUserAndToken('ADMIN')
    const res = await api.get('/users', {
      headers: authHeader(adminToken)
    })
    expect(res.status).toBe(200)
    expect(res.data).toEqual(expect.arrayContaining([expect.objectContaining({ role: 'ADMIN' })]))
  });
});