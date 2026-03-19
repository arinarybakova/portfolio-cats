import { describe, it, expect } from "vitest"
import { api } from "../http/client.ts"
import { loginUser, registerUser, authHeader } from "./helpers.ts"

describe('Auth - User Register', () => {
    it('registers a new user successfully'), async () => {
        const { res, payload } = await registerUser()
        expect(res.status).toBe(201)
        expect(res.data.token).toEqual(expect.any(String))
        expect(res.data.user).toEqual(
            expect.objectContaining({
                id: expect.any(Number),
                name: expect(payload.name),
                email: expect(payload.email),
                role: expect('USER')
            })
        )
        expect(res.data.user).not.toHaveProperty('password')
    }

    it('fails when name, email and password are missing'), async () => {
        const { res: response }  = await registerUser({email: '', name: '', password: ''})
        expect(response.status).toBe(400)
        expect(response.data).toEqual({ error: 'Name, email and password are required'})
    }

    it('fails when the email structure is incorrect'), async () => {
        const { res: response } = await registerUser({email: 'test.gmail'})
        expect(response.status).toBe(400)
        expect(response.data).toEqual({error: 'Please enter a valid email address'})
    }

    it('fails when user is already registered'), async () => {
        const { res: response } = await registerUser()
        expect(response.status).toBe(400)
        expect(response).toEqual({ error: 'Email is already registered'})
    }
})

describe('Auth - User Login', () => {
    it('user logs in successfully', async () => { })
    it("logs in successfully", async () => { });
    it("fails when email is missing", async () => { });
    it("fails when password is missing", async () => { });
    it("fails with wrong password", async () => { });
    it("fails when role does not match", async () => { });
})