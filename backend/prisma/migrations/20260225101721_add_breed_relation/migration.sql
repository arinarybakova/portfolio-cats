/*
  Warnings:

  - You are about to drop the column `breed` on the `Cat` table. All the data in the column will be lost.
  - Added the required column `breedId` to the `Cat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cat" DROP COLUMN "breed",
ADD COLUMN     "breedId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Breed" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Breed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Breed_name_key" ON "Breed"("name");

-- CreateIndex
CREATE INDEX "Cat_breedId_idx" ON "Cat"("breedId");

-- AddForeignKey
ALTER TABLE "Cat" ADD CONSTRAINT "Cat_breedId_fkey" FOREIGN KEY ("breedId") REFERENCES "Breed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
