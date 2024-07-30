/*
  Warnings:

  - You are about to drop the column `purchase_id` on the `d_purchase_status` table. All the data in the column will be lost.
  - Added the required column `d_purchase_id` to the `d_purchase_status` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `d_purchase_status` DROP FOREIGN KEY `d_purchase_status_purchase_id_fkey`;

-- AlterTable
ALTER TABLE `d_purchase_status` DROP COLUMN `purchase_id`,
    ADD COLUMN `d_purchase_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `d_purchase_status` ADD CONSTRAINT `d_purchase_status_d_purchase_id_fkey` FOREIGN KEY (`d_purchase_id`) REFERENCES `d_purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
