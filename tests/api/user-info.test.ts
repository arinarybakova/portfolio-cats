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

async function createAddress(token: string, overrides = {}) {
    const res = await api.post(
        "/me/addresses",
        makeAddressInput(overrides),
        {
            headers: authHeader(token),
        }
    )

    return res.data as AddressResponse
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

    it("creating address marked as not default", async () => {
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
    it("rejecting request without authentication token", async () => {
        const { token } = await createUserAndToken('USER')
        const address = await createAddress(token)
        const res = await api.put(`/addresses/${address.id}`, {})
        expect(res.status).toBe(401)
        expect(res.data).toEqual({ error: 'Unauthorized' })
    })

    it("rejecting request with invalid or expired token", async () => {
        const { token } = await createUserAndToken('USER')
        const address = await createAddress(token)
        const res = await api.put(`/addresses/${address.id}`, {}, { headers: authHeader('invalid-token') })
        expect(res.status).toBe(401)
        expect(res.data).toEqual({ error: 'Invalid or expired token' })
    })

    it("rejecting request with expired token", async () => {
        const { token, user } = await createUserAndToken('USER')
        const expiredToken = generateExpiredToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        const address = await createAddress(token)
        const res = await api.put(`/addresses/${address.id}`, {}, { headers: authHeader(expiredToken) })
        expect(res.status).toBe(401)
        expect(res.data).toEqual({ error: 'Invalid or expired token' })
    })

    it("handling update of non-existent address", async () => {
        const { token, user } = await createUserAndToken('USER')
        const res = await api.put('/addresses/00000', {}, { headers: authHeader(token) })
        expect(res.status).toBe(404)
        expect(res.data).toEqual({ error: 'Address not found' })
    })

    it("preventing non-owner non-admin user from updating address", async () => {
        const { token: ownerToken } = await createUserAndToken("USER")
        const { token: otherUserToken } = await createUserAndToken("USER")

        const createRes = await api.post(
            "/me/addresses",
            makeAddressInput(),
            {
                headers: authHeader(ownerToken),
            }
        )

        const address = createRes.data as AddressResponse

        const res = await api.put(
            `/addresses/${address.id}`,
            {
                city: "Updated City",
            },
            {
                headers: authHeader(otherUserToken),
            }
        )

        expect(res.status).toBe(403)
        expect(res.data).toEqual({ error: "Access denied" })
    })

    it("allowing admin to update another user's address", async () => {
        const { token: adminToken } = await createUserAndToken("ADMIN")
        const { token: userToken } = await createUserAndToken("USER")

        const createRes = await api.post(
            "/me/addresses",
            makeAddressInput(),
            {
                headers: authHeader(userToken),
            }
        )

        const address = createRes.data as AddressResponse

        const res = await api.put(
            `/addresses/${address.id}`,
            {
                city: "Updated City",
            },
            {
                headers: authHeader(adminToken),
            }
        )

        expect(res.status).toBe(200)
        const getRes = await api.get("/me/addresses", {
            headers: authHeader(userToken),
        })

        const createdAddress = createRes.data as AddressResponse

        const addresses = getRes.data as AddressResponse[]
        const persistedAddress = addresses.find(a => a.id === createdAddress.id)

        expect(persistedAddress).toBeDefined()
        expect(persistedAddress!.city).toBe("Updated City")
    })
})


it("updating address and verifying persisted changes", async () => {
    const { token } = await createUserAndToken("USER")

    const createRes = await api.post(
        "/me/addresses",
        makeAddressInput({
            label: "Home",
            city: "Old City",
        }),
        {
            headers: authHeader(token),
        }
    )

    const createdAddress = createRes.data as AddressResponse

    const updateRes = await api.put(
        `/addresses/${createdAddress.id}`,
        {
            city: "New City",
            label: "Updated Home",
        },
        {
            headers: authHeader(token),
        }
    )

    const updatedAddress = updateRes.data as AddressResponse

    expect(updateRes.status).toBe(200)
    expect(updatedAddress.id).toBe(createdAddress.id)
    expect(updatedAddress.city).toBe("New City")
    expect(updatedAddress.label).toBe("Updated Home")

    const getRes = await api.get("/me/addresses", {
        headers: authHeader(token),
    })

    const addresses = getRes.data as AddressResponse[]
    const persistedAddress = addresses.find(a => a.id === createdAddress.id)

    expect(persistedAddress).toBeDefined()
    expect(persistedAddress!.city).toBe("New City")
    expect(persistedAddress!.label).toBe("Updated Home")
})

it("setting address as default and unsetting others", async () => {
    const { token: userToken } = await createUserAndToken("USER")

    const createRes = await api.post(
        "/me/addresses",
        makeAddressInput(),
        {
            headers: authHeader(userToken),
        }
    )

    const address = createRes.data as AddressResponse

    const res = await api.put(
        `/addresses/${address.id}`,
        {
            city: "Updated City",
            isDefault: false,
        },
        {
            headers: authHeader(userToken),
        }
    )

    expect(res.status).toBe(200)
    const getRes = await api.get("/me/addresses", {
        headers: authHeader(userToken),
    })

    const createdAddress = createRes.data as AddressResponse

    const addresses = getRes.data as AddressResponse[]
    const persistedAddress = addresses.find(a => a.id === createdAddress.id)

    expect(persistedAddress).toBeDefined()
    expect(persistedAddress!.city).toBe("Updated City")

})

describe("DELETE /addresses/:addressId", () => {
    it("rejecting request without authentication token", async () => {
        const { token } = await createUserAndToken('USER')
        const address = await createAddress(token)
        const res = await api.delete(`/addresses/${address.id}`)
        expect(res.status).toBe(401)
        expect(res.data).toEqual({ error: 'Unauthorized' })
    })

    it("rejecting request with invalid token", async () => {
        const { token } = await createUserAndToken('USER')
        const address = await createAddress(token)
        const res = await api.delete(`/addresses/${address.id}`,
            {
                headers: authHeader('invalid-token')
            })
        expect(res.status).toBe(401)
        expect(res.data).toEqual({ error: 'Invalid or expired token' })
    })

    it("rejecting request with expired token", async () => {
        const { user, token } = await createUserAndToken('USER')
        const address = await createAddress(token)
        const expiredToken = await generateExpiredToken({
            id: user.id,
            email: user.email,
            role: user.role
        })
        const res = await api.delete(`/addresses/${address.id}`,
            {
                headers: authHeader(expiredToken)
            })
        expect(res.status).toBe(401)
        expect(res.data).toEqual({ error: 'Invalid or expired token' })
    })

    it("handling deletion of non-existent address", async () => {
        const { token: userToken } = await createUserAndToken('USER')
        const res = await api.delete(`/addresses/313131`,
            {
                headers: authHeader(userToken)
            })
        expect(res.status).toBe(404)
        expect(res.data).toEqual({ error: 'Address not found' })
    })

    it("preventing deletion by non-owner non-admin user", async () => {
        const { token: ownerToken } = await createUserAndToken('USER')
        const { token: otherUserToken } = await createUserAndToken('USER')
        const address = await createAddress(ownerToken)
        const res = await api.delete(`/addresses/${address.id}`,
            {
                headers: authHeader(otherUserToken)
            })
        expect(res.status).toBe(403)
        expect(res.data).toEqual({ error: 'Access denied' })
    })

    it("allowing admin to delete another user's address", async () => {
        const { token: ownerToken } = await createUserAndToken('USER')
        const { token: adminToken } = await createUserAndToken('ADMIN')
        const address = await createAddress(ownerToken)
        const res = await api.delete(`/addresses/${address.id}`,
            {
                headers: authHeader(adminToken)
            })
        expect(res.status).toBe(200)
        expect(res.data).toEqual({ message: 'Address deleted successfully' })
        const getRes = await api.get('/me/addresses', {
            headers: authHeader(ownerToken)
        })
        const addresses = getRes.data as AddressResponse[]
        const deletedAddress = addresses.find(a => a.id === address.id)
        expect(deletedAddress).toBeUndefined()
    })

    it("successful deletion by address owner", async () => {
        const { token: userToken } = await createUserAndToken('USER')
        const address = await createAddress(userToken)
        const res = await api.delete(`/addresses/${address.id}`,
            {
                headers: authHeader(userToken)
            })
        expect(res.status).toBe(200)
        expect(res.data).toEqual({ message: 'Address deleted successfully' })
        const getRes = await api.get('/me/addresses', {
            headers: authHeader(userToken)
        })
        const addresses = getRes.data as AddressResponse[]
        const deletedAddress = addresses.find(a => a.id === address.id)
        expect(deletedAddress).toBeUndefined()
    })

    it("ensuring other users' addresses are not deleted", async () => {
        const { token: userToken } = await createUserAndToken('USER')
        const firstAddress = await createAddress(userToken)
        const secondAddress = await createAddress(userToken)
        const res = await api.delete(`/addresses/${firstAddress.id}`,
            {
                headers: authHeader(userToken)
            })
        expect(res.status).toBe(200)
        expect(res.data).toEqual({ message: 'Address deleted successfully' })
         const getRes = await api.get('/me/addresses', {
            headers: authHeader(userToken)
        })
        const addresses = getRes.data as AddressResponse[]
        const presistedAddress = addresses.find(a => a.id === secondAddress.id)
        const deletedAddress = addresses.find(a => a.id === firstAddress.id)

        expect(deletedAddress).toBeUndefined()
        expect(presistedAddress).toBeDefined()
    })
})