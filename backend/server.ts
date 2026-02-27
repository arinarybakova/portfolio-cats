import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient()

export default prisma

const app = express();
app.use(cors());
app.use(express.json());
app.get("/test", (req, res) => {
  res.json({ message: "test works" });
});

/* =======================================================
   USERS
======================================================= */

app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error("GET /users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: req.body,
    });
    res.status(201).json(user);
  } catch (error) {
    console.error("POST /users error:", error);
    res.status(500).json({ error: "Failed to create user" });
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
    console.error("BREEDS ERROR:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/* =======================================================
   CATS
======================================================= */

/* GET ALL CATS */
app.get("/cats", async (req, res) => {
  try {
    const cats = await prisma.cat.findMany({
      include: { breed: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(cats);
  } catch (error) {
    console.error("GET /cats error:", error);
    res.status(500).json({ error: "Failed to fetch cats" });
  }
});

/* GET SINGLE CAT */
app.get("/cats/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const cat = await prisma.cat.findUnique({
      where: { id },
      include: { breed: true },
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

/* CREATE CAT */
app.post("/cats", async (req, res) => {
  try {
    const { name, age, image, status, breedId } = req.body;

    const newCat = await prisma.cat.create({
      data: {
        name,
        age,
        image,
        status: status || "AVAILABLE",
        breed: {
          connect: { id: breedId },
        },
      },
      include: { breed: true },
    });

    res.status(201).json(newCat);
  } catch (error) {
    console.error("POST /cats error:", error);
    res.status(500).json({ error: "Failed to create cat" });
  }
});

/* UPDATE CAT */
app.put("/cats/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, age, image, status, breedId } = req.body;

    const updatedCat = await prisma.cat.update({
      where: { id },
      data: {
        name,
        age,
        image,
        status,
        ...(breedId && {
          breed: {
            connect: { id: breedId },
          },
        }),
      },
      include: { breed: true },
    });

    res.json(updatedCat);
  } catch (error) {
    console.error("PUT /cats error:", error);
    res.status(500).json({ error: "Failed to update cat" });
  }
});

/* DELETE CAT */
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
  console.log("Server running on http://localhost:5000");
});