import { describe, it, expect } from "vitest";
import { api } from "../http/client";
import { authHeader } from "./utils.ts/userHelper";
import { createUserAndToken } from "./utils.ts/userHelper";
import { generateExpiredToken } from "./utils.ts/jwtHelper";

describe("Breeds - Get", () => {
    it("rejects get request without authentication", async () => {
        const res = await api.get("/breeds");

        expect(res.status).toBe(401);
        expect(res.data).toEqual({ error: "Unauthorized" });
    });

    it("rejects get request with invalid token", async () => {
        const res = await api.get("/breeds",
            {
                headers: authHeader("invalid-token")
            })
        expect(res.status).toBe(401)
        expect(res.data).toEqual({ error: "Invalid or expired token" });
    })

    it("rejects get request with expired token", async () => {
        const { user } = await createUserAndToken('USER')
        const expiredToken = generateExpiredToken({
            id: user.id,
            email: user.email,
            role: user.role
        })
        
        const res = await api.get("/breeds",
            {
                headers: authHeader(expiredToken)
            })
        expect(res.status).toBe(401)
        expect(res.data).toEqual({ error: "Invalid or expired token" });
    })

    it("returns all breeds successfully", async () => {
        const { token: userToken } = await createUserAndToken('ADMIN')
        const res = await api.get("/breeds",
            {
                headers: authHeader(userToken)
            })
        expect(res.status).toBe(200)
        expect(res.data).length(10);
    })

    it("rejects non admin access", async () => {
        const { token: userToken } = await createUserAndToken('USER')
        const res = await api.get("/breeds",
            {
                headers: authHeader(userToken)
            })
        expect(res.status).toBe(403)
        expect(res.data).toEqual({ error: 'Admin access required'})
    })

});