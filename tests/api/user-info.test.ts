import { describe, it, expect } from "vitest";
import { api } from "../http/client";
import { loginUser, authHeader } from "./utils.ts/userHelper";
import { createUserAndToken } from "./utils.ts/userHelper";
import { generateExpiredToken, generateToken } from "./utils.ts/jwtHelper";
import { use } from "react";


describe("GET /me", () => {
    it("rejecting request without authentication token", async () => {
        const res = await api.get('/me')
        expect(res.status).toBe(401)
        expect(res.data).toEqual({ error: 'Unauthorized' })
    })

    it("rejecting request with invalid token", async () => {
        const res = await api.get('/me', {
            headers: authHeader('invalid-token')
        })
        expect(res.data).toEqual({ error: 'Invalid or expired token' })
    })

    it("rejecting request with expired token", async () => {
        const { user } = await createUserAndToken("USER");
        const expiredToken = generateExpiredToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        const res = await api.get('/me', {
            headers: authHeader(expiredToken)
        })
        expect(res.data).toEqual({ error: 'Invalid or expired token' })
    })

    it("retrieving user data as admin and validating it", async () => {
        const { user: user, token: adminToken } = await createUserAndToken('ADMIN')
        const res = await api.get('/me', {
            headers: authHeader(adminToken)
        })
        expect(res.status).toBe(200)
        expect(res.status).toBe(200)
        expect(res.data).toHaveProperty('id')
        expect(res.data).toHaveProperty('email', user.email)
        expect(res.data).toHaveProperty('name', user.name)
        expect(res.data).toHaveProperty('cats')
        expect(res.data).toHaveProperty('role')
        expect(res.data).not.toHaveProperty('password')
    })

    it("retrieving user data as a user and validating data", async () => {
        const { user: user, token: userToken } = await createUserAndToken('USER')
        const res = await api.get('/me',
        {
            headers: authHeader(userToken)
        })
        expect(res.status).toBe(200)
        expect(res.data).toHaveProperty('id')
        expect(res.data).toHaveProperty('email', user.email)
        expect(res.data).toHaveProperty('name', user.name)
        expect(res.data).toHaveProperty('cats')
        expect(res.data).toHaveProperty('role')
        expect(res.data).not.toHaveProperty('password')
    })
})

describe("PUT /me/password", () => {
    it("rejecting request without authentication token", async () => {
        const res = await api.put("/me/password", {
            currentPassword: "123456",
            newPassword: "newpass123",
        })

        expect(res.status).toBe(401)
        expect(res.data).toEqual({ error: "Unauthorized" })
    })

    it("rejecting request with invalid token", async () => {
        const res = await api.put('/me/password',
            {
                currentPassword: "123456",
                newPassword: "newpass123"
            },
            {
                headers: authHeader('invalid-token')

            })
        expect(res.data).toEqual({ error: 'Invalid or expired token' })
    })

    it("rejecting request with expired token", async () => {
        const { user } = await createUserAndToken("USER");
        const expiredToken = generateExpiredToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        const res = await api.put('/me/password',
            {
                currentPassword: "123456",
                newPassword: "newpass123",
            },
            {
                headers: authHeader(expiredToken)
            })
        expect(res.status).toBe(401)
        expect(res.data).toEqual({ error: 'Invalid or expired token' })
    })

    it("validating missing currentPassword, newPassword field", async () => {
        const { token: userToken } = await createUserAndToken("USER")
        const res = await api.put('/me/password',
        {},
        {
            headers: authHeader(userToken)
        })
        expect(res.status).toBe(400)
        expect(res.data).toEqual({ error: 'currentPassword and newPassword are required' })
    })

    it("validating minimum length requirement for new password", async () => {
        const { user, token: userToken } = await createUserAndToken("USER")
        const res = await api.put('/me/password',
            {
                currentPassword: user.password,
                newPassword: "newss",
            },
            {
                headers: authHeader(userToken)
            },)
        expect(res.status).toBe(400)
        expect(res.data).toEqual({ error: 'New password must be at least 6 characters' })
    })

    it("rejecting update when current password is incorrect", async () => {
        const { token: userToken } = await createUserAndToken("USER")
        const res = await api.put('/me/password',
            {
                currentPassword: "dada",
                newPassword: "newss_44123"
            },
            {
                headers: authHeader(userToken)
            })
        expect(res.status).toBe(400)
        expect(res.data).toEqual({ error: 'Current password is incorrect' })
    })

    it("successful password update and login", async () => {
        const newPassword = "Test1!44123"
        const { user, plainPassword,  token: userToken } = await createUserAndToken("USER")
        const res = await api.put('/me/password',
            {
                currentPassword: plainPassword,
                newPassword: newPassword
            },
            {
                headers: authHeader(userToken)
            })
        expect(res.status).toBe(200)
        expect(res.data).toEqual({ message: 'Password updated successfully'})
        console.log(res.data)
        const response = await loginUser({
            email: user.email,
            password: newPassword,
        })
        expect(response.status).toBe(200)
    })

    it("preventing login with old password after update", async () => {
        const { user, plainPassword, token: userToken } = await createUserAndToken("USER")
        const res = await api.put('/me/password',
            {
                currentPassword: plainPassword,
                newPassword: "Test1!44123"
            },
            {
                headers: authHeader(userToken)
            })
        expect(res.status).toBe(200)
        expect(res.data).toEqual({ message: 'Password updated successfully'})
        console.log(res.data)
        const response = await loginUser({
            email: user.email,
            password: plainPassword,
        })
        expect(response.status).toBe(401)
        expect(response.data).toEqual({ error: 'Invalid email or password' })
    })

})

describe("GET /me/addresses", () => {
    it("rejecting request without authentication token")

    it("rejecting request with invalid or expired token")

    it("handling user with no saved addresses")

    it("retrieving only addresses belonging to authenticated user")

    it("ensuring addresses are ordered by default and creation date")
})

describe("POST /me/addresses", () => {
    it("rejecting request without authentication token")

    it("rejecting request with invalid or expired token")

    it("validating missing line1 field")

    it("validating missing city field")

    it("validating missing country field")

    it("successful creation of a new address")

    it("assigning created address to authenticated user")

    it("defaulting isDefault to false when not provided")

    it("creating address marked as default")

    it("ensuring only one default address per user")

    it("handling optional address fields correctly")
})

describe("PUT /addresses/:addressId", () => {
    it("rejecting request without authentication token")

    it("rejecting request with invalid or expired token")

    it("handling update of non-existent address")

    it("preventing update by non-owner non-admin user")

    it("allowing admin to update another user's address")

    it("allowing owner to update their own address")

    it("updating only provided fields")

    it("setting address as default and unsetting others")

    it("ensuring other users' addresses are not affected")
})

describe("DELETE /addresses/:addressId", () => {
    it("rejecting request without authentication token")

    it("rejecting request with invalid or expired token")

    it("handling deletion of non-existent address")

    it("preventing deletion by non-owner non-admin user")

    it("allowing admin to delete another user's address")

    it("successful deletion by address owner")

    it("ensuring other users' addresses are not deleted")
})