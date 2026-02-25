/*
  Warnings:

  - A unique constraint covering the columns `[pin]` on the table `Form` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pin` to the `Form` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pin" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Form_pin_key" ON "Form"("pin");
