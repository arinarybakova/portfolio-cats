import { describe, it, expect } from "vitest";
import { api } from "../http/client";
import { loginUser, authHeader, getTokenByEmail } from "./utils.ts/userHelper";
import { createUserAndToken } from "./utils.ts/userHelper";
import { generateExpiredToken, generateToken } from "./utils.ts/jwtHelper";
import { use } from "react";

type AddressInput = {
    label?: string | null
    line1: string
    line2?: string | null
    city: string
    state?: string | null
    postalCode?: string | null
    country: string
    isDefault?: boolean
    notes?: string | null
}

type AddressResponse = {
    id: number
    label: string | null
    line1: string
    line2: string | null
    city: string
    state: string | null
    postalCode: string | null
    country: string
    isDefault: boolean
    notes: string | null
    createdAt: string
    updatedAt: string
    userId: number
}

function makeAddressInput(overrides: Partial<AddressInput> = {}): AddressInput {
    return {
        label: "Home",
        line1: "Street 121-3",
        line2: null,
        city: "Kur",
        state: "LV",
        postalCode: "3123123",
        country: "Latvia",
        isDefault: true,
        notes: null,
        ...overrides,
    }
}

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
        const { user, plainPassword, token: userToken } = await createUserAndToken("USER")
        const res = await api.put('/me/password',
            {
                currentPassword: plainPassword,
                newPassword: newPassword
            },
            {
                headers: authHeader(userToken)
            })
        expect(res.status).toBe(200)
        expect(res.data).toEqual({ message: 'Password updated successfully' })
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
        expect(res.data).toEqual({ message: 'Password updated successfully' })
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
    it("rejecting request without authentication token", async () => {
        const res = await api.get('/me/addresses')
        expect(res.status).toBe(401)
        expect(res.data).toEqual({ error: 'Unauthorized' })
    })

    it("rejecting request with invalid token", async () => {
        const res = await api.get('/me/addresses', {
            headers: authHeader('invalid-token')
        })
        expect(res.status).toBe(401)
        expect(res.data).toEqual({ error: 'Invalid or expired token' })
    })

    it("rejecting request with expired token", async () => {
        const { user } = await createUserAndToken("USER");
        const expiredToken = generateExpiredToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        const res = await api.get('/me/addresses', {
            headers: authHeader(expiredToken)
        })
        expect(res.status).toBe(401)
        expect(res.data).toEqual({ error: 'Invalid or expired token' })
    })

    it("retrieving addresses belonging to authenticated user", async () => {
        const { token } = await getTokenByEmail('user32@gmail.com')
        const res = await api.get('/me/addresses', {
            headers: authHeader(token)
        })
        const addresses = res.data as AddressInput[]

        expect(res.status).toBe(200)
        expect(Array.isArray(res.data)).toBe(true)
        expect(res.data).toHaveLength(2)
        expect(addresses[0]).toMatchObject({
            id: 3,
            label: "Home Sweet Home",
            line1: "Street 121-3",
            line2: '4',
            city: "Kur",
            state: "LV",
            postalCode: "3123123",
            country: "Latvia",
            isDefault: true,
            notes: "FOR ME",
            userId: 5,
        })

        expect(addresses[1]).toMatchObject({
            id: 4,
            label: "Work",
            line1: "D42",
            line2: null,
            city: "Masa",
            state: null,
            postalCode: "21313",
            country: "Armenia",
            isDefault: false,
            notes: null,
            userId: 5,
        })
    })
})

describe("POST /me/addresses", () => {

    it("rejecting request without authentication token", async () => {
        const res = await api.post('/me/addresses')
        expect(res.status).toBe(401)
        expect(res.data).toEqual({ error: 'Unauthorized' })
    })

    it("rejecting request with invalid token", async () => {
        const res = await api.post(
            '/me/addresses',
            {},
            {
                headers: authHeader('invalid-token')
            }
        )
        expect(res.status).toBe(401)
        expect(res.data).toEqual({ error: 'Invalid or expired token' })
    })

    it("rejecting request with expired token", async () => {
        const { user } = await createUserAndToken("USER");
        const expiredToken = generateExpiredToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        const res = await api.post('/me/addresses', {
            headers: authHeader(expiredToken)
        })
        expect(res.status).toBe(401)
        expect(res.data).toEqual({ error: 'Unauthorized' })
    })

    it("validating missing body", async () => {
        const { user, token } = await createUserAndToken("USER");

        const res = await api.post(
            '/me/addresses',
            {},
            {
                headers: authHeader(token)
            }
        )
        expect(res.status).toBe(400)
        expect(res.data).toEqual({ error: 'line1, city and country are required' })
    })

    it("successful creation of a new address", async () => {
        const { user, token } = await createUserAndToken('USER')
        const body = makeAddressInput()
        const res = await api.post('/me/addresses',
            
                body
            ,
            {
                headers: authHeader(token)
            })
        const data = res.data as AddressResponse

        expect(res.status).toBe(201)
        expect(data).toMatchObject({
            label: body.label,
            line1: body.line1,
            city: body.city,
            country: body.country,
            userId: user.id,
        })

        expect(data.id).toBeTypeOf("number")
        expect(data.createdAt).toBeTypeOf("string")
        expect(data.updatedAt).toBeTypeOf("string")
        expect(data.isDefault).toBe(true)
    })

    it("creating address marked as default", async () => {
        const { token } = await createUserAndToken("USER")

        const res = await api.post(
            "/me/addresses",
            makeAddressInput({
                isDefault: false,
            }),
            {
                headers: authHeader(token),
            }
        )

        const data = res.data as AddressResponse

        expect(res.status).toBe(201)
        expect(data.isDefault).toBe(false)
    })

    it("ensuring only one default address per user", async () => {
        const { token } = await createUserAndToken("USER")

        // first default
        await api.post(
            "/me/addresses",
            makeAddressInput({
                label: "First",
                isDefault: true,
            }),
            {
                headers: authHeader(token),
            }
        )

        // second default (should override first)
        await api.post(
            "/me/addresses",
            makeAddressInput({
                label: "Second",
                line1: "Another street",
                isDefault: true,
            }),
            {
                headers: authHeader(token),
            }
        )

        const res = await api.get("/me/addresses", {
            headers: authHeader(token),
        })

        const addresses = res.data as AddressResponse[]

        const defaultAddresses = addresses.filter(a => a.isDefault)

        expect(defaultAddresses).toHaveLength(1)
        expect(defaultAddresses[0].label).toBe("Second")
    })

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