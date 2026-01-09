/*
  Warnings:

  - You are about to drop the column `tipo` on the `Service` table. All the data in the column will be lost.
  - Made the column `serviceTypeId` on table `Service` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_serviceTypeId_fkey";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "tipo",
ALTER COLUMN "serviceTypeId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
