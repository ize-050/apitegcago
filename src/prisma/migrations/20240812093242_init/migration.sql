/*
  Warnings:

  - You are about to drop the column `purchase_id` on the `d_sale_agentcy` table. All the data in the column will be lost.
  - You are about to drop the column `purchase_id` on the `d_sale_agentcy_file` table. All the data in the column will be lost.
  - Added the required column `d_purchase_id` to the `d_sale_agentcy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `d_purchase_id` to the `d_sale_agentcy_file` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `d_sale_agentcy` DROP FOREIGN KEY `d_sale_agentcy_purchase_id_fkey`;

-- AlterTable
ALTER TABLE `d_sale_agentcy` DROP COLUMN `purchase_id`,
    ADD COLUMN `d_purchase_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `d_sale_agentcy_file` DROP COLUMN `purchase_id`,
    ADD COLUMN `d_purchase_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `d_sale_agentcy` ADD CONSTRAINT `d_sale_agentcy_d_purchase_id_fkey` FOREIGN KEY (`d_purchase_id`) REFERENCES `d_purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
