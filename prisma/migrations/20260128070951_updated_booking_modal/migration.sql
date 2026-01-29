/*
  Warnings:

  - You are about to drop the column `scheduledAt` on the `Booking` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[availabilityId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `availabilityId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "scheduledAt",
ADD COLUMN     "availabilityId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Availability_tutorId_idx" ON "Availability"("tutorId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_availabilityId_key" ON "Booking"("availabilityId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "Availability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
