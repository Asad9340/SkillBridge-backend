/*
  Warnings:

  - Made the column `subjectId` on table `Availability` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Availability" DROP CONSTRAINT "Availability_subjectId_fkey";

-- AlterTable
ALTER TABLE "Availability" ALTER COLUMN "subjectId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
