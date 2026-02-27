import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.breed.createMany({
    data: [
      { name: "Persian" },
      { name: "Maine Coon" },
      { name: "British Shorthair" },
      { name: "Ragdoll" },
      { name: "Siamese" },
      { name: "Bengal" },
      { name: "Sphynx" },
      { name: "Scottish Fold" },
      { name: "Abyssinian" },
      { name: "Russian Blue" },
    ],
    skipDuplicates: true,
  });

  console.log("Breeds seeded 🌱");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
