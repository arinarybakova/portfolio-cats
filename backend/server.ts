import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

/* ================= PRISMA ================= */

export const prisma = new PrismaClient();

/* ================= APP SETUP ================= */

const app = express();
app.use(cors());
app.use(express.json());

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
  return undefined; // means "not provided"
}

/* =======================================================
   USERS
======================================================= */

app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({include: { cats: true }});
    res.json(users);
  } catch (error) {
    console.error("GET /users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role,
      },
    });

    res.status(201).json(user);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const user = await prisma.user.update({
      where: { id },
      data: req.body,
    });

    res.json(user);
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

/* =======================================================
   START SERVER
======================================================= */

app.listen(5000, "0.0.0.0", () => {
  console.log("🚀 Server running on http://localhost:5000");
});