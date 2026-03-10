import express from "express";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/* ================= PRISMA ================= */

export const prisma = new PrismaClient();

/* ================= APP SETUP ================= */

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

type TokenPayload = {
  id: number;
  email: string;
  role: string;
};

type AuthRequest = express.Request & {
  user?: TokenPayload;
};

function isTokenPayload(value: unknown): value is TokenPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "email" in value &&
    "role" in value &&
    typeof (value as any).id === "number" &&
    typeof (value as any).email === "string" &&
    typeof (value as any).role === "string"
  );
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return secret;
}

const JWT_SECRET = getJwtSecret();

function authMiddleware(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parts = authHeader.split(" ");
    const token = parts[1];

    if (!token) {
      return res.status(401).json({ error: "Token missing" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!isTokenPayload(decoded)) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

app.get("/test", (req, res) => {
  res.json({ message: "test works" });
});

function parseBoolean(value: any): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "true") return true;
    if (v === "false") return false;
  }
  return undefined;
}

function createToken(user: { id: number; email: string; role: string }) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function requireAdmin(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
}

/* =======================================================
   AUTH
======================================================= */

app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const safeRole = String(role || "USER").toUpperCase() === "ADMIN" ? "ADMIN" : "USER";

    const user = await prisma.user.create({
      data: {
        name,
        email: String(email).toLowerCase(),
        password: hashedPassword,
        role: safeRole as any,
      },
    });

    const token = createToken({
      id: user.id,
      email: user.email,
      role: String(user.role),
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("POST /auth/register error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (role && String(role).toUpperCase() !== String(user.role).toUpperCase()) {
      return res.status(401).json({ error: "Selected account type does not match this user" });
    }

    const token = createToken({
      id: user.id,
      email: user.email,
      role: String(user.role),
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("POST /auth/login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

app.get("/auth/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { cats: true },
    });

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      cats: currentUser.cats,
    });
  } catch (error) {
    console.error("GET /auth/me error:", error);
    res.status(500).json({ error: "Failed to fetch current user" });
  }
});

/* =======================================================
   USERS
======================================================= */

app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { cats: true },
    });

    const safeUsers = users.map(({ password, ...user }) => user);
    res.json(safeUsers);
  } catch (error) {
    console.error("GET /users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: String(email).toLowerCase(),
        password: hashedPassword,
        role: String(role || "USER").toUpperCase() as any,
      },
    });

    const { password: _password, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id },
      include: { cats: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error("GET /users/:id error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = { ...req.body };

    if (data.password) {
      data.password = await bcrypt.hash(String(data.password), 10);
    }

    if (data.email) {
      data.email = String(data.email).toLowerCase();
    }

    if (data.role) {
      data.role = String(data.role).toUpperCase();
    }

    const user = await prisma.user.update({
      where: { id },
      data,
    });

    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error("PUT /users error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE /users error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

/* =======================================================
   BREEDS
======================================================= */

app.get("/breeds", async (req, res) => {
  try {
    const breeds = await prisma.breed.findMany();
    res.json(breeds);
  } catch (error) {
    console.error("GET /breeds error:", error);
    res.status(500).json({ error: "Failed to fetch breeds" });
  }
});

/* =======================================================
   CATS WITH FIXED FILTERING
======================================================= */

app.get("/cats", async (req, res) => {
  console.log("🔥 CATS ROUTE HIT");
console.log("QUERY RECEIVED:", req.query);
  try {
    const {
      search,
      minAge,
      maxAge,
      breedId,
      status,
      fromDate,
      toDate,
    } = req.query;

    const where: any = {};

    /* 🔎 SEARCH */
    if (search && String(search).trim() !== "") {
      where.OR = [
        {
          name: {
            contains: String(search),
            mode: "insensitive",
          },
        },
        {
          status: {
            contains: String(search),
            mode: "insensitive",
          },
        },
        {
          breed: {
            name: {
              contains: String(search),
              mode: "insensitive",
            },
          },
        },
      ];
    }

    /* 🐱 BREED FILTER (FIXED EMPTY STRING ISSUE) */
    if (breedId !== undefined && breedId !== "") {
      where.breedId = Number(breedId);
    }

    /* 📌 STATUS FILTER */
    if (status !== undefined && status !== "") {
      where.status = String(status);
    }

    /* 🎂 AGE FILTER */
    if (minAge !== undefined && minAge !== "" || maxAge !== undefined && maxAge !== "") {
      where.age = {};

      if (minAge !== undefined && minAge !== "") {
        where.age.gte = Number(minAge);
      }

      if (maxAge !== undefined && maxAge !== "") {
        where.age.lte = Number(maxAge);
      }
    }

    /* 📅 DATE FILTER */
    if (
      (fromDate !== undefined && fromDate !== "") ||
      (toDate !== undefined && toDate !== "")
    ) {
      where.createdAt = {};

      if (fromDate !== undefined && fromDate !== "") {
        where.createdAt.gte = new Date(String(fromDate));
      }

      if (toDate !== undefined && toDate !== "") {
        where.createdAt.lte = new Date(String(toDate));
      }
    }

    console.log("FILTER OBJECT:", JSON.stringify(where, null, 2));

    const cats = await prisma.cat.findMany({
      where,
      include: { breed: true, owner: true },
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log("🚀 FINAL WHERE OBJECT:", JSON.stringify(where, null, 2));

    res.json(cats);
  } catch (error) {
    console.error("GET /cats error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch cats",
    });
  }
});

/* =======================================================
   SINGLE CAT
======================================================= */

app.get("/cats/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const cat = await prisma.cat.findUnique({
      where: { id },
      include: { breed: true, owner: true },
    });

    if (!cat) {
      return res.status(404).json({ message: "Cat not found" });
    }

    res.json(cat);
  } catch (error) {
    console.error("GET /cats/:id error:", error);
    res.status(500).json({ error: "Failed to fetch cat" });
  }
});

/* =======================================================
   CREATE CAT
======================================================= */

app.post("/cats", async (req, res) => {
  try {
    const { name, age, image, status, breedId } = req.body;
    const priority = parseBoolean(req.body?.priority) ?? false;

    const newCat = await prisma.cat.create({
      data: {
        name,
        age: Number(age),
        image,
        status: status || "AVAILABLE",
        priority: Boolean(priority) || false,
        breed: {
          connect: {
            id: Number(breedId),
          },
        },
      },
      include: { breed: true, owner: true },
    });

    res.status(201).json(newCat);
  } catch (error) {
    console.error("POST /cats error:", error);
    res.status(500).json({ error: "Failed to create cat" });
  }
});

/* =======================================================
   UPDATE CAT
======================================================= */

app.put("/cats/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    // ✅ Log what backend receives
    console.log("PUT /cats/:id body:", req.body);

    const { name, age, image, status, breedId } = req.body;

    // ✅ IMPORTANT: declare + parse priority properly
    const priorityRaw = req.body?.priority;
    const priority =
      typeof priorityRaw === "boolean"
        ? priorityRaw
        : typeof priorityRaw === "string"
          ? priorityRaw.toLowerCase() === "true"
          : undefined;

    console.log("Parsed priority:", priority);

    const updatedCat = await prisma.cat.update({
      where: { id },
      data: {
        name,
        age: Number(age),
        image,
        status,

        // ✅ THIS is the actual write
        ...(priority !== undefined ? { priority } : {}),

        ...(breedId && {
          breed: { connect: { id: Number(breedId) } },
        }),
      },
      include: { breed: true, owner: true },
    });

    console.log("Updated cat returned:", updatedCat);

    res.json(updatedCat);
  } catch (error) {
    console.error("PUT /cats error:", error);
    res.status(500).json({ error: "Failed to update cat" });
  }
});

app.post("/cats/:id/assign-owner", async (req, res) => {
  try {
    const catId = Number(req.params.id);
    const { ownerId } = req.body;

    if (!ownerId) {
      return res.status(400).json({ error: "ownerId is required" });
    }

    const updatedCat = await prisma.cat.update({
      where: { id: catId },
      data: {
        ownerId: Number(ownerId),
        status: "ADOPTED",
      },
      include: { breed: true, owner: true },
    });

    res.json(updatedCat);
  } catch (error) {
    console.error("Assign owner error:", error);
    res.status(500).json({ error: "Failed to assign owner" });
  }
});

/* =======================================================
   REMOVE OWNER
======================================================= */

app.post("/cats/:id/remove-owner", async (req, res) => {
  try {
    const catId = Number(req.params.id);

    const updatedCat = await prisma.cat.update({
      where: { id: catId },
      data: {
        ownerId: null,
        status: "AVAILABLE",
      },
      include: { breed: true, owner: true },
    });

    res.json(updatedCat);
  } catch (error) {
    console.error("Remove owner error:", error);
    res.status(500).json({ error: "Failed to remove owner" });
  }
});

/* =======================================================
   DELETE CAT
======================================================= */

app.delete("/cats/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.cat.delete({
      where: { id },
    });

    res.json({ message: "Cat deleted successfully" });
  } catch (error) {
    console.error("DELETE /cats error:", error);
    res.status(500).json({ error: "Failed to delete cat" });
  }
});

app.get("/dashboard/stats", async (req, res) => {
  try {
    const [
      totalCats,
      availableCats,
      adoptedCats,
      pendingCats,
      totalUsers,
      totalBreeds,
      ownersCount,
      recentCats,
      recentUsers,
      catsByBreedRaw,
      catsByStatusRaw,
    ] = await Promise.all([
      prisma.cat.count(),
      prisma.cat.count({ where: { status: "AVAILABLE" } }),
      prisma.cat.count({ where: { status: "ADOPTED" } }),
      prisma.cat.count({ where: { status: "PENDING" } }),
      prisma.user.count(),
      prisma.breed.count(),
      prisma.user.count({
        where: {
          cats: {
            some: {},
          },
        },
      }),
      prisma.cat.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { breed: true, owner: true },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { id: "desc" },
        include: { cats: true },
      }),
      prisma.breed.findMany({
        include: { cats: true },
      }),
      prisma.cat.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      }),
    ]);

    const catsByBreed = catsByBreedRaw.map((breed) => ({
      id: breed.id,
      name: breed.name,
      count: breed.cats.length,
    }));

    const catsByStatus = catsByStatusRaw.map((item) => ({
      status: item.status,
      count: item._count.status,
    }));

    res.json({
      overview: {
        totalCats,
        availableCats,
        adoptedCats,
        pendingCats,
        totalUsers,
        totalBreeds,
        ownersCount,
      },
      recentCats,
      recentUsers,
      catsByBreed,
      catsByStatus,
    });
  } catch (error) {
    console.error("GET /dashboard/stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

/* =======================================================
   START SERVER
======================================================= */

app.listen(5000, "0.0.0.0", () => {
  console.log("🚀 Server running on http://localhost:5000");
});

