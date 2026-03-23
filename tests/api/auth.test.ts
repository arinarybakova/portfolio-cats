import { describe, it, expect } from "vitest"
import { api } from "../http/client.ts"
import { loginUser, registerUser} from "./utils.ts/userHelper.ts"

describe('Auth - User Register', () => {
    it("registers a new user successfully", async () => {
        const { res, payload } = await registerUser()
        const data = res.data as any
        expect(res.status).toBe(201);
        expect(data).not.toHaveProperty("token")
        expect(data).toHaveProperty("user")
        expect(data.user.id).toBeTypeOf("number")
        expect(data.user.name).toBe(payload.name)
        expect(data.user.email).toBe(payload.email.toLowerCase())
        expect(data.user.role).toBe("USER")
        });

    it('fails when name, email and password are missing', async () => {
        const { res: response }  = await registerUser({email: '', name: '', password: ''})
        expect(response.status).toBe(400)
        expect(response.data).toEqual({ error: 'Name, email and password are required'})
    })

    it('fails when the email structure is incorrect', async () => {
        const { res: response } = await registerUser({email: 'test.gmail'})
        expect(response.status).toBe(400)
        expect(response.data).toEqual({error: 'Please enter a valid email address'})
    })

    it('fails when user is already registered', async () => {
        const payload = {
            name: "Ari",
            email: "ari@example.com",
            password: "123456",
        };
         await registerUser(payload);
        const { res: response } = await registerUser(payload);
        expect(response.status).toBe(400)
        expect(response.data).toEqual({ error: 'Email is already registered'})
    })
})

describe('Auth - User Login', () => {
    it('user logs in successfully', async () => {
        const { payload } = await registerUser()
        const response = await loginUser({
            email: payload.email,
            password: payload.password,
        })
        expect(response.status).toBe(200)
     })

    it("fails when email, password are missing", async () => { 
        const response = await loginUser({
            email: '',
            password: ''
        })
        expect(response.status).toBe(400)
        expect(response.data).toEqual({error: 'Email and password are required'})
    })

    it("fails with wrong password provided", async () => {
        const { payload } = await registerUser()
        const response = await loginUser({
            email: payload.email,
            password: 'Test123!'
        })
        expect(response.status).toBe(401)
        expect(response.data).toEqual({error: 'Invalid email or password'})
     })

    it("fails when role does not match", async () => {
        const { payload } = await registerUser()
        const response = await loginUser({
            email: payload.email,
            password: payload.password,
            role: 'ADMIN'
        })
        expect(response.status).toBe(401)
        expect(response.data).toEqual({error: 'Selected account type does not match this user'})
     })

     it("fails when user is not registered", async () => {
        const { payload } = await registerUser()
        const response = await loginUser({
            email: 'tes31kkdkfka@gmail.com',
            password: 'test!22142_'
        })
        expect(response.status).toBe(401)
        expect(response.data).toEqual({error: 'Invalid email or password'})
     })
})