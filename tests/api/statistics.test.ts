import { describe, it, expect } from "vitest";
import { api } from "../http/client";
import { authHeader } from "./utils.ts/userHelper";
import { createUserAndToken } from "./utils.ts/userHelper";
import { generateExpiredToken, generateToken } from "./utils.ts/jwtHelper";

describe("Breeds - Get", () => {
    it("rejects get request without authentication", async () => {
        const res = await api.get("/dashboard/stats");

        expect(res.status).toBe(401);
        expect(res.data).toEqual({ error: "Unauthorized" });
    });

    it("rejects get request with invalid token", async () => {
        const res = await api.get("/dashboard/stats",
            {
                headers: authHeader("invalid-token")
            })
        expect(res.status).toBe(401)
        expect(res.data).toEqual({ error: "Invalid or expired token" });
    })

    it("rejects get statistics with expired token", async () => {
        const { user } = await createUserAndToken('USER')
        const expiredToken = generateExpiredToken({
            id: user.id,
            email: user.email,
            role: user.role
        })
        const res = await api.get("/dashboard/stats",
            {
                headers: authHeader(expiredToken)
            })
        expect(res.status).toBe(401)
        expect(res.data).toEqual({ error: "Invalid or expired token" });
    })

    it("returns all statistics", async () => {
        const { token: userToken } = await createUserAndToken('ADMIN')
        const res = await api.get("/dashboard/stats",
            {
                headers: authHeader(userToken)
            })
        expect(res.status).toBe(200)
        expect(res.data).toHaveProperty('overview')
        expect(res.data).toHaveProperty('recentCats')
        expect(res.data).toHaveProperty('catsByBreed')
        expect(res.data).toHaveProperty('catsByStatus')
        expect(res.data).toHaveProperty('overview.totalCats')
        expect(res.data).toHaveProperty('overview.availableCats')
        expect(res.data).toHaveProperty('overview.adoptedCats')
        expect(res.data).toHaveProperty('overview.pendingCats')
        expect(res.data).toHaveProperty('overview.totalUsers')
        expect(res.data).toHaveProperty('overview.totalBreeds')
        expect(res.data).toHaveProperty('overview.ownersCount')
    })


    it("does not return statistics for a user role", async () => {
        const { token: userToken } = await createUserAndToken('USER')
        const res = await api.get("/dashboard/stats",
            {
                headers: authHeader(userToken)
            })
        expect(res.status).toBe(403)
        expect(res.data).toEqual({ error: 'Admin access required'})
    })

});