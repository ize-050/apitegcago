/*
  Warnings:

  - You are about to drop the column `payment_type_id` on the `d_purchase_customer_payment` table. All the data in the column will be lost.
  - Added the required column `payment_image_name` to the `d_purchase_customer_payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_path` to the `d_purchase_customer_payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_type` to the `d_purchase_customer_payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `d_purchase` ADD COLUMN `d_purchase_ref` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `d_purchase_customer_payment` DROP COLUMN `payment_type_id`,
    ADD COLUMN `payment_image_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `payment_path` VARCHAR(191) NOT NULL,
    ADD COLUMN `payment_type` VARCHAR(191) NOT NULL;
