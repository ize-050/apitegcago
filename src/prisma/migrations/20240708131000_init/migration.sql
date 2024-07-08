/*
  Warnings:

  - Made the column `d_purchase_id` on table `d_product_image` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `d_product_image` MODIFY `d_purchase_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `d_product_image` ADD CONSTRAINT `d_product_image_d_purchase_id_fkey` FOREIGN KEY (`d_purchase_id`) REFERENCES `d_purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
