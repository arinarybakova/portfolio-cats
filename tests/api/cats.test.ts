import { describe, it, expect } from "vitest";
import { api } from "../http/client";
import { authHeader } from "./utils.ts/userHelper";
import { createUserAndToken } from "./utils.ts/userHelper";
import { generateExpiredToken, generateToken } from "./utils.ts/jwtHelper";

async function createCatForTests(
    adminToken: string,
    overrides: Partial<CatInput> = {}
): Promise<CatResponse> {
    const input = makeCatInput(overrides);

    const res = await api.post("/cats", input, {
        headers: authHeader(adminToken),
    });

    expect(res.status).toBe(201);

    return res.data as CatResponse;
}

export type CatStatus = "AVAILABLE" | "ADOPTED" | "PENDING";

export type CatInput = {
    name: string;
    age: number;
    image: string;
    status?: CatStatus;
    breedId: number;
    priority?: boolean;
};

export type BreedResponse = {
    id: number;
    name: string;
    createdAt: string;
};

export type OwnerResponse = {
    id: number;
    name: string;
    email: string;
    password: string;
    role: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
};

export type CatResponse = {
    id: number;
    name: string;
    age: number;
    status: CatStatus;
    image: string;
    createdAt: string;
    updatedAt: string;
    breedId: number;
    ownerId: number | null;
    priority: boolean;

    breed: BreedResponse;
    owner: OwnerResponse | null;
};

export function makeCatInput(
    overrides: Partial<CatInput> = {}
): CatInput {
    return {
        name: "Test Cat",
        age: 2,
        image: "https://cdn2.thecatapi.com/images/test.jpg",
        status: "AVAILABLE",
        breedId: 1,
        priority: false,
        ...overrides,
    };
}

describe("Cats endpoints", () => {

    describe("GET /cats", () => {
        it("should return all cats for admin", async () => {
            const { token } = await createUserAndToken("ADMIN");

            const res = await api.get("/cats", {
                headers: authHeader(token),
            });

            expect(res.status).toBe(200)
            const data = res.data as CatResponse[]
            expect(Array.isArray(res.data)).toBe(true);
            expect(data.length).toBeGreaterThan(5);
            expect(data[0]).toHaveProperty("id");
            expect(data[0]).toHaveProperty("owner");
            expect(data[0]).toHaveProperty("breed");
        });

        it("should return 401 when token is missing", async () => {
            const res = await api.get("/cats")
            expect(res.status).toBe(401)
            expect(res.data).toEqual({ error: 'Unauthorized' })
        });

        it("should return 401 when token is invalid", async () => {
            const res = await api.get("/cats",
                {
                    headers: authHeader('invalid-token')
                }
            )
            expect(res.status).toBe(401)
            expect(res.data).toEqual({ error: 'Invalid or expired token' })
        });

        it("should return 401 when token is expired", async () => {
            const { user } = await createUserAndToken('ADMIN')
            const expiredToken = generateExpiredToken({
                id: user.id,
                email: user.email,
                role: user.role
            })

            const res = await api.get('/cats',
                {
                    headers: authHeader(expiredToken)
                }
            )
            expect(res.status).toBe(401)
            expect(res.data).toEqual({ error: 'Invalid or expired token' })
        });

        it("should return 403 for non-admin user", async () => {
            const { token } = await createUserAndToken('USER')

            const res = await api.get('/cats',
                {
                    headers: authHeader(token)
                }
            )
            expect(res.status).toBe(403)
            expect(res.data).toEqual({ error: 'Admin access required' })
        });

        it("should filter cats by search query", async () => {
            const { token } = await createUserAndToken("ADMIN");

            const search = "Test";

            const res = await api.get("/cats", {
                headers: authHeader(token),
                params: { search },
            });

            expect(res.status).toBe(200);

            const data = res.data as CatResponse[];

            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);

            const lowerSearch = search.toLowerCase();

            data.forEach((cat) => {
                const matchesName = cat.name.toLowerCase().includes(lowerSearch);
                const matchesStatus = cat.status.toLowerCase().includes(lowerSearch);
                const matchesBreed = cat.breed.name.toLowerCase().includes(lowerSearch);

                expect(matchesName || matchesStatus || matchesBreed).toBe(true);
            });
        });

        it("should filter cats by breedId", async () => {
            const { token } = await createUserAndToken("ADMIN");
            const breedId = 2;

            const res = await api.get("/cats", {
                headers: authHeader(token),
                params: { breedId },
            });

            expect(res.status).toBe(200);

            const data = res.data as CatResponse[];

            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);

            data.forEach((cat) => {
                expect(cat.breedId).toBe(breedId);
            });
        });

        it("should filter cats by status", async () => {
            const { token } = await createUserAndToken("ADMIN");
            const status: CatStatus = "AVAILABLE";

            const res = await api.get("/cats", {
                headers: authHeader(token),
                params: { status },
            });

            expect(res.status).toBe(200);

            const data = res.data as CatResponse[];

            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);

            data.forEach((cat) => {
                expect(cat.status).toBe(status);
            });
        });

        it("should filter cats by minAge only", async () => {
            const { token } = await createUserAndToken("ADMIN");
            const minAge = 2;

            const res = await api.get("/cats", {
                headers: authHeader(token),
                params: { minAge },
            });

            expect(res.status).toBe(200);

            const data = res.data as CatResponse[];

            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);

            data.forEach((cat) => {
                expect(cat.age).toBeGreaterThanOrEqual(minAge);
            });
        });

        it("should filter cats by maxAge only", async () => {
            const { token } = await createUserAndToken("ADMIN");
            const maxAge = 3;

            const res = await api.get("/cats", {
                headers: authHeader(token),
                params: { maxAge },
            });

            expect(res.status).toBe(200);

            const data = res.data as CatResponse[];

            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);

            data.forEach((cat) => {
                expect(cat.age).toBeLessThanOrEqual(maxAge);
            });
        });

        it("should filter cats by minAge and maxAge", async () => {
            const { token } = await createUserAndToken("ADMIN");
            const minAge = 2;
            const maxAge = 4;

            const res = await api.get("/cats", {
                headers: authHeader(token),
                params: { minAge, maxAge },
            });

            expect(res.status).toBe(200);

            const data = res.data as CatResponse[];

            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);

            data.forEach((cat) => {
                expect(cat.age).toBeGreaterThanOrEqual(minAge);
                expect(cat.age).toBeLessThanOrEqual(maxAge);
            });
        });

        it("should filter cats by fromDate only", async () => {
            const { token } = await createUserAndToken("ADMIN");
            const fromDate = "2026-03-03";

            const res = await api.get("/cats", {
                headers: authHeader(token),
                params: { fromDate },
            });

            expect(res.status).toBe(200);

            const data = res.data as CatResponse[];
            const fromTime = new Date(fromDate).getTime();

            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);

            data.forEach((cat) => {
                const createdAt = new Date(cat.createdAt).getTime();
                expect(createdAt).toBeGreaterThanOrEqual(fromTime);
            });
        });

        it("should filter cats by toDate only", async () => {
            const { token } = await createUserAndToken("ADMIN");
            const toDate = "2026-03-11T23:59:59.999Z";

            const res = await api.get("/cats", {
                headers: authHeader(token),
                params: { toDate },
            });

            expect(res.status).toBe(200);

            const data = res.data as CatResponse[];
            const toTime = new Date(toDate).getTime();

            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);

            data.forEach((cat) => {
                const createdAt = new Date(cat.createdAt).getTime();
                expect(createdAt).toBeLessThanOrEqual(toTime);
            });
        });

        it("should filter cats by fromDate and toDate", async () => {
            const { token } = await createUserAndToken("ADMIN");
            const fromDate = "2026-03-03";
            const toDate = "2026-03-11T23:59:59.999Z";

            const res = await api.get("/cats", {
                headers: authHeader(token),
                params: { fromDate, toDate },
            });

            expect(res.status).toBe(200);

            const data = res.data as CatResponse[];
            const fromTime = new Date(fromDate).getTime();
            const toTime = new Date(toDate).getTime();

            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);

            data.forEach((cat) => {
                const createdAt = new Date(cat.createdAt).getTime();
                expect(createdAt).toBeGreaterThanOrEqual(fromTime);
                expect(createdAt).toBeLessThanOrEqual(toTime);
            });
        });

        it("should combine multiple filters correctly", async () => {
            const { token } = await createUserAndToken("ADMIN");

            const params = {
                breedId: 2,
                status: "AVAILABLE",
                minAge: 1,
                maxAge: 5,
            };

            const res = await api.get("/cats", {
                headers: authHeader(token),
                params,
            });

            expect(res.status).toBe(200);

            const data = res.data as CatResponse[];

            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);

            data.forEach((cat) => {
                expect(cat.breedId).toBe(params.breedId);
                expect(cat.status).toBe(params.status);
                expect(cat.age).toBeGreaterThanOrEqual(params.minAge);
                expect(cat.age).toBeLessThanOrEqual(params.maxAge);
            });
        });

        it("should ignore empty query params", async () => {
            const { token } = await createUserAndToken("ADMIN");

            const res = await api.get("/cats", {
                headers: authHeader(token),
                params: {
                    search: "",
                    breedId: "",
                    status: "",
                    minAge: "",
                    maxAge: "",
                    fromDate: "",
                    toDate: "",
                },
            });

            expect(res.status).toBe(200);

            const data = res.data as CatResponse[];

            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);
        });

        it("should return 500 when database throws", async () => {
            const { token } = await createUserAndToken("ADMIN");

            const res = await api.get("/cats", {
                headers: authHeader(token),
                params: {
                    fromDate: "invalid-date",
                },
            });

            expect(res.status).toBe(500);
            expect(res.data).toHaveProperty("error");
        });
    });

    describe("GET /cats/:id", () => {

        it("should return cat for admin", async () => {
            const { token } = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(token);

            const res = await api.get(`/cats/${cat.id}`, {
                headers: authHeader(token),
            });

            expect(res.status).toBe(200);

            const data = res.data as CatResponse;

            expect(data.id).toBe(cat.id);
            expect(data).toHaveProperty("breed");
            expect(data).toHaveProperty("owner");
        });

        it("should return cat for owner", async () => {
            const admin = await createUserAndToken("ADMIN");
            const user = await createUserAndToken("USER");

            const cat = await createCatForTests(admin.token);

            const assignRes = await api.post(
                `/cats/${cat.id}/assign-owner`,
                { ownerId: user.user.id },
                { headers: authHeader(admin.token) }
            );

            expect(assignRes.status).toBe(200);

            const res = await api.get(`/cats/${cat.id}`, {
                headers: authHeader(user.token),
            });

            expect(res.status).toBe(200);

            const data = res.data as CatResponse;

            expect(data.id).toBe(cat.id);
            expect(data.name).toBe(cat.name);

            expect(data.ownerId).toBe(user.user.id);
            expect(data.owner?.name).toBe(user.user.name)
            expect(data.owner?.email).toBe(user.user.email)

        });

        it("should return 401 when token is missing", async () => {
            const admin = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(admin.token);

            const res = await api.get(`/cats/${cat.id}`);

            expect(res.status).toBe(401);
        });

        it("should return 401 when token is invalid", async () => {
            const admin = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(admin.token);

            const res = await api.get(`/cats/${cat.id}`, {
                headers: authHeader("invalid-token"),
            });

            expect(res.status).toBe(401);
        });

        it("should return 401 when token is expired", async () => {
            const { user, token } = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(token);

            const expiredToken = generateExpiredToken({
                id: user.id,
                email: user.email,
                role: user.role,
            });

            const res = await api.get(`/cats/${cat.id}`, {
                headers: authHeader(expiredToken),
            });

            expect(res.status).toBe(401);
        });

        it("should return 403 when user is not owner and not admin", async () => {
            const admin = await createUserAndToken("ADMIN");
            const user = await createUserAndToken("USER");

            const cat = await createCatForTests(admin.token);

            const res = await api.get(`/cats/${cat.id}`, {
                headers: authHeader(user.token),
            });

            expect(res.status).toBe(403);
        });

        it("should return 404 when cat does not exist", async () => {
            const { token } = await createUserAndToken("ADMIN");

            const res = await api.get("/cats/99999999", {
                headers: authHeader(token),
            });

            expect(res.status).toBe(404);
        });
    });

    describe("POST /cats", () => {

        it("should create cat for admin", async () => {
            const { token } = await createUserAndToken("ADMIN");

            const input = makeCatInput({
                name: "Test Create Cat",
                age: 2,
                breedId: 1,
                priority: true,
                status: "AVAILABLE",
            });

            const res = await api.post("/cats", input, {
                headers: authHeader(token),
            });

            expect(res.status).toBe(201);

            const data = res.data as CatResponse;

            expect(data.id).toBeDefined();
            expect(data.name).toBe(input.name);
            expect(data.age).toBe(input.age);
            expect(data.image).toBe(input.image);
            expect(data.status).toBe(input.status);
            expect(data.breedId).toBe(input.breedId);
            expect(data.priority).toBe(true);
            expect(data).toHaveProperty("breed");
            expect(data).toHaveProperty("owner");
        });

        it("should create duplicate cats with different ids", async () => {
            const { token } = await createUserAndToken("ADMIN");

            const input = makeCatInput({
                name: "Same Cat",
                age: 2,
                breedId: 1,
                status: "AVAILABLE",
                priority: false,
            });

            const firstRes = await api.post("/cats", input, {
                headers: authHeader(token),
            });

            const secondRes = await api.post("/cats", input, {
                headers: authHeader(token),
            });

            expect(firstRes.status).toBe(201);
            expect(secondRes.status).toBe(201);

            const firstCat = firstRes.data as CatResponse;
            const secondCat = secondRes.data as CatResponse;

            expect(firstCat.id).toBeDefined();
            expect(secondCat.id).toBeDefined();

            expect(firstCat.id).not.toBe(secondCat.id);

            expect(firstCat.name).toBe(input.name);
            expect(secondCat.name).toBe(input.name);

            expect(firstCat.breedId).toBe(input.breedId);
            expect(secondCat.breedId).toBe(input.breedId);
        });


        it("should create cat with default status when status is missing", async () => {
            const { token } = await createUserAndToken("ADMIN");

            const input = makeCatInput();
            delete (input as Partial<CatInput>).status;

            const res = await api.post("/cats", input, {
                headers: authHeader(token),
            });

            expect(res.status).toBe(201);

            const data = res.data as CatResponse;

            expect(data.status).toBe("AVAILABLE");
        });

        it("should create cat with priority false when priority is missing", async () => {
            const { token } = await createUserAndToken("ADMIN");

            const input = makeCatInput();
            delete (input as Partial<CatInput>).priority;

            const res = await api.post("/cats", input, {
                headers: authHeader(token),
            });

            expect(res.status).toBe(201);

            const data = res.data as CatResponse;

            expect(data.priority).toBe(false);
        });

        it("should return 401 when token is missing", async () => {
            const input = makeCatInput();

            const res = await api.post("/cats", input);

            expect(res.status).toBe(401);
            expect(res.data).toHaveProperty("error");
        });

        it("should return 401 when token is invalid", async () => {
            const input = makeCatInput();

            const res = await api.post("/cats", input, {
                headers: authHeader("invalid-token"),
            });

            expect(res.status).toBe(401);
            expect(res.data).toHaveProperty("error");
        });

        it("should return 401 when token is expired", async () => {
            const { user } = await createUserAndToken('ADMIN')
            const expiredToken = await generateExpiredToken(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
            )

            const input = makeCatInput();

            const res = await api.post("/cats", input, {
                headers: authHeader(expiredToken),
            });

            expect(res.status).toBe(401);
            expect(res.data).toHaveProperty("error");
        });

        it("should return 403 for non-admin user", async () => {
            const { token } = await createUserAndToken("USER");

            const input = makeCatInput();

            const res = await api.post("/cats", input, {
                headers: authHeader(token),
            });

            expect(res.status).toBe(403);
            expect(res.data).toHaveProperty("error");
        });

        it("should return 500 when breed does not exist", async () => {
            const { token } = await createUserAndToken("ADMIN");

            const input = makeCatInput({
                breedId: 999999,
            });

            const res = await api.post("/cats", input, {
                headers: authHeader(token),
            });

            expect(res.status).toBe(500);
            expect(res.data).toEqual({ error: 'Failed to create cat' });
        });

        it("should return error when required parameters are missing", async () => {
            const { token } = await createUserAndToken("ADMIN");

            const res = await api.post(
                "/cats",
                {},
                {
                    headers: authHeader(token),
                }
            );

            expect(res.status).toBeGreaterThanOrEqual(400);
            expect(res.data).toEqual({ error: 'Failed to create cat' });
        });
    });

    describe("PUT /cats/:id", () => {

        it("should update cat for admin", async () => {
            const { token } = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(token, {
                name: "Old Name",
                age: 2,
                breedId: 1,
                priority: false,
            });

            const res = await api.put(
                `/cats/${cat.id}`,
                {
                    name: "New Name",
                    age: 5,
                    image: "https://cdn2.thecatapi.com/images/updated.jpg",
                    status: "PENDING",
                },
                {
                    headers: authHeader(token),
                }
            );

            expect(res.status).toBe(200);

            const data = res.data as CatResponse;

            expect(data.id).toBe(cat.id);
            expect(data.name).toBe("New Name");
            expect(data.age).toBe(5);
            expect(data.image).toBe("https://cdn2.thecatapi.com/images/updated.jpg");
            expect(data.status).toBe("PENDING");
        });

        it("should update cat priority when priority is boolean true", async () => {
            const { token } = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(token, { priority: false });

            const res = await api.put(
                `/cats/${cat.id}`,
                {
                    name: cat.name,
                    age: cat.age,
                    image: cat.image,
                    status: cat.status,
                    priority: true,
                },
                {
                    headers: authHeader(token),
                }
            );

            expect(res.status).toBe(200);

            const data = res.data as CatResponse;
            expect(data.priority).toBe(true);
        });

        it("should update cat priority when priority is string true", async () => {
            const { token } = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(token, { priority: false });

            const res = await api.put(
                `/cats/${cat.id}`,
                {
                    name: cat.name,
                    age: cat.age,
                    image: cat.image,
                    status: cat.status,
                    priority: "true",
                },
                {
                    headers: authHeader(token),
                }
            );

            expect(res.status).toBe(200);

            const data = res.data as CatResponse;
            expect(data.priority).toBe(true);
        });

        it("should update cat priority when priority is string false", async () => {
            const { token } = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(token, { priority: true });

            const res = await api.put(
                `/cats/${cat.id}`,
                {
                    name: cat.name,
                    age: cat.age,
                    image: cat.image,
                    status: cat.status,
                    priority: "false",
                },
                {
                    headers: authHeader(token),
                }
            );

            expect(res.status).toBe(200);

            const data = res.data as CatResponse;
            expect(data.priority).toBe(false);
        });

        it("should not overwrite priority when priority is undefined", async () => {
            const { token } = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(token, { priority: true });

            const res = await api.put(
                `/cats/${cat.id}`,
                {
                    name: "Changed Name",
                    age: cat.age,
                    image: cat.image,
                    status: cat.status,
                },
                {
                    headers: authHeader(token),
                }
            );

            expect(res.status).toBe(200);

            const data = res.data as CatResponse;
            expect(data.name).toBe("Changed Name");
            expect(data.priority).toBe(true);
        });

        it("should update breed when breedId is provided", async () => {
            const { token } = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(token, { breedId: 1 });

            const res = await api.put(
                `/cats/${cat.id}`,
                {
                    name: cat.name,
                    age: cat.age,
                    image: cat.image,
                    status: cat.status,
                    breedId: 2,
                },
                {
                    headers: authHeader(token),
                }
            );

            expect(res.status).toBe(200);

            const data = res.data as CatResponse;
            expect(data.breedId).toBe(2);
            expect(data.breed.id).toBe(2);
        });

        it("should not update breed when breedId is not provided", async () => {
            const { token } = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(token, { breedId: 1 });

            const res = await api.put(
                `/cats/${cat.id}`,
                {
                    name: "Still Same Breed",
                    age: cat.age,
                    image: cat.image,
                    status: cat.status,
                },
                {
                    headers: authHeader(token),
                }
            );

            expect(res.status).toBe(200);

            const data = res.data as CatResponse;
            expect(data.name).toBe("Still Same Breed");
            expect(data.breedId).toBe(1);
            expect(data.breed.id).toBe(1);
        });

        it("should return 401 when token is missing", async () => {
            const admin = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(admin.token);

            const res = await api.put(`/cats/${cat.id}`, {
                name: "No Token Update",
                age: 4,
                image: cat.image,
                status: "AVAILABLE",
            });

            expect(res.status).toBe(401);
            expect(res.data).toHaveProperty("error");
        });

        it("should return 401 when token is invalid", async () => {
            const admin = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(admin.token);

            const res = await api.put(
                `/cats/${cat.id}`,
                {
                    name: "Invalid Token Update",
                    age: 4,
                    image: cat.image,
                    status: "AVAILABLE",
                },
                {
                    headers: authHeader("invalid-token"),
                }
            );

            expect(res.status).toBe(401);
            expect(res.data).toEqual({ error: "Invalid or expired token"});
        });

        it("should return 401 when token is expired", async () => {
            const { user, token } = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(token);

            const expiredToken = await generateExpiredToken({
                id: user.id,
                email: user.email,
                role: user.role
            })

            const res = await api.put(
                `/cats/${cat.id}`,
                {
                    name: "Expired Token Update",
                    age: 4,
                    image: cat.image,
                    status: "AVAILABLE",
                },
                {
                    headers: authHeader(expiredToken),
                }
            );

            expect(res.status).toBe(401);
            expect(res.data).toEqual({ error: "Invalid or expired token"});
        });

        it("should return 403 for non-admin user", async () => {
            const admin = await createUserAndToken("ADMIN");
            const user = await createUserAndToken("USER");
            const cat = await createCatForTests(admin.token);

            const res = await api.put(
                `/cats/${cat.id}`,
                {
                    name: "User Update Attempt",
                    age: 4,
                    image: cat.image,
                    status: "AVAILABLE",
                },
                {
                    headers: authHeader(user.token),
                }
            );

            expect(res.status).toBe(403);
            expect(res.data).toEqual({ error: 'Admin access required' });
        });

        it("should return 500 when cat does not exist", async () => {
            const { token } = await createUserAndToken("ADMIN");

            const res = await api.put(
                "/cats/99999999",
                {
                    name: "Missing Cat",
                    age: 4,
                    image: "https://cdn2.thecatapi.com/images/missing.jpg",
                    status: "AVAILABLE",
                },
                {
                    headers: authHeader(token),
                }
            );

            expect(res.status).toBe(500);
            expect(res.data).toEqual({ error: 'Failed to update cat'});
        });
    });

    it("should return error when request body is missing", async () => {
        const { token } = await createUserAndToken("ADMIN");
        const cat = await createCatForTests(token);

        const res = await api.put(
            `/cats/${cat.id}`,
            {},
            {
                headers: authHeader(token),
            }
        );

        expect(res.status).toBe(500);
        expect(res.data).toEqual({ error: "Failed to update cat"});

    });

    describe("POST /cats/:id/assign-owner", () => {
        it("should assign owner and set status to ADOPTED for admin", async () => {
            const admin = await createUserAndToken("ADMIN");
            const user = await createUserAndToken("USER");

            const cat = await createCatForTests(admin.token);

            const res = await api.post(
                `/cats/${cat.id}/assign-owner`,
                { ownerId: user.user.id },
                { headers: authHeader(admin.token) }
            );

            expect(res.status).toBe(200);

            const data = res.data as CatResponse;
            expect(data.ownerId).toBe(user.user.id);
            expect(data.status).toBe("ADOPTED");
        });

        it("should return 400 when ownerId is missing", async () => {
            const admin = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(admin.token);

            const res = await api.post(
                `/cats/${cat.id}/assign-owner`,
                {},
                { headers: authHeader(admin.token) }
            );

            expect(res.status).toBe(400);
            expect(res.data).toEqual({ error: 'ownerId is required' })
        });

        it("should return 401 when token is missing", async () => {
            const admin = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(admin.token);

            const res = await api.post(`/cats/${cat.id}/assign-owner`, {
                ownerId: 1,
            });

            expect(res.status).toBe(401);
            expect(res.data).toEqual({ error: 'Unauthorized' })

        });

        it("should return 401 when token is invalid", async () => {
            const admin = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(admin.token);

            const res = await api.post(
                `/cats/${cat.id}/assign-owner`,
                { ownerId: 1 },
                { headers: authHeader("invalid") }
            );

            expect(res.status).toBe(401);
            expect(res.data).toEqual({ error: 'Invalid or expired token' })

        });

        it("should return 401 when token is expired", async () => {
            const { user } = await createUserAndToken('ADMIN')
            const expiredToken = await generateExpiredToken({
                id: user.id,
                email: user.email,
                role: user.role
            })

            const admin = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(admin.token);

            const res = await api.post(
                `/cats/${cat.id}/assign-owner`,
                { ownerId: 1 },
                { headers: authHeader(expiredToken) }
            );

            expect(res.status).toBe(401);
            expect(res.data).toEqual({ error: 'Invalid or expired token' })

        });

        it("should return 403 for non-admin user", async () => {
            const admin = await createUserAndToken("ADMIN");
            const user = await createUserAndToken("USER");

            const cat = await createCatForTests(admin.token);

            const res = await api.post(
                `/cats/${cat.id}/assign-owner`,
                { ownerId: user.user.id },
                { headers: authHeader(user.token) }
            );

            expect(res.status).toBe(403);
            expect(res.data).toEqual({ error: 'Admin access required' })
        });

        it("should return 500 when cat does not exist", async () => {
            const { token } = await createUserAndToken("ADMIN");

            const res = await api.post(
                `/cats/099992221199/assign-owner`,
                { ownerId: 1 },
                { headers: authHeader(token) }
            );

            expect(res.status).toBe(500);
            expect(res.data).toEqual({ error: 'Failed to assign owner' })

        });

        it("should return 500 when owner does not exist", async () => {
            const admin = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(admin.token);

            const res = await api.post(
                `/cats/${cat.id}/assign-owner`,
                { ownerId: 999999 },
                { headers: authHeader(admin.token) }
            );

            expect(res.status).toBe(500);
            expect(res.data).toEqual({ error: 'Failed to assign owner' })

        });
    });

    describe("POST /cats/:id/remove-owner", () => {
        it("should remove owner and set status to AVAILABLE for admin", async () => {
            const admin = await createUserAndToken("ADMIN");
            const user = await createUserAndToken("USER");

            const cat = await createCatForTests(admin.token);

            await api.post(
                `/cats/${cat.id}/assign-owner`,
                { ownerId: user.user.id },
                { headers: authHeader(admin.token) }
            );

            const res = await api.post(
                `/cats/${cat.id}/remove-owner`,
                {},
                { headers: authHeader(admin.token) }
            );

            expect(res.status).toBe(200);

            const data = res.data as CatResponse;
            expect(data.ownerId).toBeNull();
            expect(data.status).toBe("AVAILABLE");
        });

        it("should return 401 when token is missing", async () => {
            const admin = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(admin.token);

            const res = await api.post(`/cats/${cat.id}/remove-owner`);

            expect(res.status).toBe(401);
            expect(res.data).toEqual({ error: 'Unauthorized' })

        });

        it("should return 401 when token is invalid", async () => {
            const admin = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(admin.token);

            const res = await api.post(
                `/cats/${cat.id}/remove-owner`,
                {},
                { headers: authHeader("invalid") }
            );

            expect(res.status).toBe(401);
            expect(res.data).toEqual({ error: 'Invalid or expired token' })

        });

        it("should return 401 when token is expired", async () => {
            const { user } = await createUserAndToken('ADMIN')
            const expiredToken = generateExpiredToken({
                id: user.id,
                email: user.email,
                role: user.role
            })

            const admin = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(admin.token);

            const res = await api.post(
                `/cats/${cat.id}/remove-owner`,
                {},
                { headers: authHeader(expiredToken) }
            );

            expect(res.status).toBe(401);
            expect(res.data).toEqual({ error: 'Invalid or expired token' })

        });

        it("should return 403 for non-admin user", async () => {
            const admin = await createUserAndToken("ADMIN");
            const user = await createUserAndToken("USER");

            const cat = await createCatForTests(admin.token);

            const res = await api.post(
                `/cats/${cat.id}/remove-owner`,
                {},
                { headers: authHeader(user.token) }
            );

            expect(res.status).toBe(403);
            expect(res.data).toEqual({ error: 'Admin access required' })

        });

        it("should return 500 when cat does not exist", async () => {
            const { token } = await createUserAndToken("ADMIN");

            const res = await api.post(
                `/cats/999999/remove-owner`,
                {},
                { headers: authHeader(token) }
            );

            expect(res.status).toBe(500);
            expect(res.data).toEqual({ error: 'Failed to remove owner' })

        });
    });

    describe("DELETE /cats/:id", () => {
        it("should delete cat for admin", async () => {
            const admin = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(admin.token);

            const res = await api.delete(`/cats/${cat.id}`, {
                headers: authHeader(admin.token),
            });

            expect(res.status).toBe(200);
        });

        it("should return 401 when token is missing", async () => {
            const admin = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(admin.token);

            const res = await api.delete(`/cats/${cat.id}`);
            expect(res.status).toBe(401);
            expect(res.data).toEqual({ error: 'Unauthorized' })

        });

        it("should return 401 when token is invalid", async () => {
            const admin = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(admin.token);

            const res = await api.delete(`/cats/${cat.id}`, {
                headers: authHeader("invalid"),
            });

            expect(res.status).toBe(401);
            expect(res.data).toEqual({ error: 'Invalid or expired token' })

        });

        it("should return 401 when token is expired", async () => {
            const { user } = await createUserAndToken('ADMIN')
            const expiredToken = await generateExpiredToken({
                id: user.id,
                email: user.email,
                role: user.role
            })

            const admin = await createUserAndToken("ADMIN");
            const cat = await createCatForTests(admin.token);

            const res = await api.delete(`/cats/${cat.id}`, {
                headers: authHeader(expiredToken),
            });

            expect(res.status).toBe(401);
            expect(res.data).toEqual({ error: 'Invalid or expired token' })

        });

        it("should return 403 for non-admin user", async () => {
            const admin = await createUserAndToken("ADMIN");
            const user = await createUserAndToken("USER");
            const cat = await createCatForTests(admin.token);

            const res = await api.delete(`/cats/${cat.id}`, {
                headers: authHeader(user.token),
            });

            expect(res.status).toBe(403);
            expect(res.data).toEqual({ error: 'Admin access required' })

        });

        it("should return 500 when cat does not exist", async () => {
            const { token } = await createUserAndToken("ADMIN");

            const res = await api.delete(`/cats/999999`, {
                headers: authHeader(token),
            });

            expect(res.status).toBe(500);
            expect(res.data).toEqual({ error: 'Failed to delete cat' })

        });
    });

    describe("GET /my/cats", () => {
        it("should return current user's cats", async () => {
            const admin = await createUserAndToken("ADMIN");
            const user = await createUserAndToken("USER");

            const cat = await createCatForTests(admin.token);

            await api.post(
                `/cats/${cat.id}/assign-owner`,
                { ownerId: user.user.id },
                { headers: authHeader(admin.token) }
            );

            const res = await api.get("/my/cats", {
                headers: authHeader(user.token),
            });

            expect(res.status).toBe(200);

            const data = res.data as CatResponse[];
            expect(data.every((c) => c.ownerId === user.user.id)).toBe(true);
        });

        it("should return 401 when token is missing", async () => {
            const res = await api.get("/my/cats");
            expect(res.status).toBe(401);
        });

        it("should return 401 when token is invalid", async () => {
            const res = await api.get("/my/cats", {
                headers: authHeader("invalid"),
            });
            expect(res.status).toBe(401);
            expect(res.data).toEqual({ error: 'Invalid or expired token' })

        });

        it("should return 401 when token is expired", async () => {
            const { user } = await createUserAndToken('ADMIN')
            const expiredToken = generateExpiredToken({
                id: user.id,
                email: user.email,
                role: user.role
            })

            const res = await api.get("/my/cats", {
                headers: authHeader(expiredToken),
            });

            expect(res.status).toBe(401);
            expect(res.data).toEqual({ error: 'Invalid or expired token' })

        });

        it("should filter current user's cats by search query", async () => {
            const user = await createUserAndToken("USER");

            const res = await api.get("/my/cats", {
                headers: authHeader(user.token),
                params: { search: "kit" },
            });

            expect(res.status).toBe(200);
        });

        it("should combine multiple filters correctly for current user", async () => {
            const user = await createUserAndToken("USER");

            const res = await api.get("/my/cats", {
                headers: authHeader(user.token),
                params: {
                    minAge: 1,
                    maxAge: 5,
                    status: "AVAILABLE",
                },
            });

            expect(res.status).toBe(200);
        });

        it("should ignore empty query params", async () => {
            const user = await createUserAndToken("USER");

            const res = await api.get("/my/cats", {
                headers: authHeader(user.token),
                params: {
                    search: "",
                    minAge: "",
                },
            });

            expect(res.status).toBe(200);
        });

        it("should return empty array when user has no cats", async () => {
            const user = await createUserAndToken("USER");

            const res = await api.get("/my/cats", {
                headers: authHeader(user.token),
            });

            expect(res.status).toBe(200);

            const data = res.data as CatResponse[];
            expect(Array.isArray(data)).toBe(true);
        });
    });
});