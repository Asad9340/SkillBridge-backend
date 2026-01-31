-- AlterTable
ALTER TABLE "Availability" ADD COLUMN     "subjectId" TEXT;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
