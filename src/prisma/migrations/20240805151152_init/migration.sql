/*
  Warnings:

  - You are about to drop the column `status_id` on the `d_purchase_status` table. All the data in the column will be lost.
  - Added the required column `status_key` to the `d_purchase_status` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `d_purchase_status` DROP FOREIGN KEY `d_purchase_status_status_id_fkey`;

-- AlterTable
ALTER TABLE `d_purchase_status` DROP COLUMN `status_id`,
    ADD COLUMN `status_key` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `d_purchase_status` ADD CONSTRAINT `d_purchase_status_status_key_fkey` FOREIGN KEY (`status_key`) REFERENCES `master_status`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
