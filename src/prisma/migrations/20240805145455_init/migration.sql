/*
  Warnings:

  - Added the required column `status_id` to the `d_purchase_status` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `d_purchase_status` ADD COLUMN `status_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `d_purchase_status` ADD CONSTRAINT `d_purchase_status_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `master_status`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
