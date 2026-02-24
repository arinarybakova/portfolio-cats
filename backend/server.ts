import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";


const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const app = express();
app.use(cors());
app.use(express.json());

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post("/users", async (req, res) => {
  const user = await prisma.user.create({
    data: req.body,
  });
  res.status(201).json(user);
});

app.put("/users/:id", async (req, res) => {
  const id = Number(req.params.id);

  const user = await prisma.user.update({
    where: { id },
    data: req.body,
  });

  res.json(user);
});

app.delete("/users/:id", async (req, res) => {
  const id = Number(req.params.id);

  await prisma.user.delete({
    where: { id },
  });

  res.json({ message: "Deleted" });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

app.get("/cats", async (req, res) => {
  const cats = await prisma.cat.findMany();
  res.json(cats);
});

app.post("/cats", async (req, res) => {
  const { name, age, breed, status, image } = req.body;

  const newCat = await prisma.cat.create({
    data: {
      name,
      age,
      breed,
      status: status ?? "available",
      image: image ?? "",
    },
  });

  res.status(201).json(newCat);
});

app.get("/cats/:id", async (req, res) => {
  const id = Number(req.params.id);

  const cat = await prisma.cat.findUnique({
    where: { id },
  });

  if (!cat) {
    return res.status(404).json({ message: "Cat not found" });
  }

  res.json(cat);
});

app.put("/cats/:id", async (req, res) => {
  const id = Number(req.params.id);

  const updated = await prisma.cat.update({
    where: { id },
    data: req.body,
  });

  res.json(updated);
});
