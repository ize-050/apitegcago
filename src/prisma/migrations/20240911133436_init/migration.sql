/*
  Warnings:

  - You are about to drop the column `cs_inspection_id` on the `cs_wait_destination` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[waitrelease_id]` on the table `cs_wait_destination` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `waitrelease_id` to the `cs_wait_destination` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `cs_wait_destination` DROP FOREIGN KEY `cs_wait_destination_cs_inspection_id_fkey`;

-- AlterTable
ALTER TABLE `cs_wait_destination` DROP COLUMN `cs_inspection_id`,
    ADD COLUMN `waitrelease_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `cs_wait_destination_waitrelease_id_key` ON `cs_wait_destination`(`waitrelease_id`);

-- AddForeignKey
ALTER TABLE `cs_wait_destination` ADD CONSTRAINT `cs_wait_destination_waitrelease_id_fkey` FOREIGN KEY (`waitrelease_id`) REFERENCES `waitrelease`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
