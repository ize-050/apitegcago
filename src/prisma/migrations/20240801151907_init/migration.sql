/*
  Warnings:

  - A unique constraint covering the columns `[cus_code]` on the table `customer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cus_code` to the `customer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `customer` ADD COLUMN `cus_code` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `d_purchase` ADD COLUMN `d_address_destination_location` VARCHAR(191) NULL,
    ADD COLUMN `d_address_origin_location` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `d_payment_type` (
    `id` VARCHAR(191) NOT NULL,
    `d_purchase_id` VARCHAR(191) NOT NULL,
    `payment_type` VARCHAR(191) NULL,
    `payment_name` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `d_payment_customer_type` (
    `id` VARCHAR(191) NOT NULL,
    `d_payment_type` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `d_purchase_customer_payment` (
    `id` VARCHAR(191) NOT NULL,
    `d_purchase_id` VARCHAR(191) NOT NULL,
    `payment_type_id` VARCHAR(191) NOT NULL,
    `payment_name` VARCHAR(191) NOT NULL,
    `payment_date` DATETIME(3) NOT NULL,
    `payment_price` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `customer_cus_code_key` ON `customer`(`cus_code`);

-- AddForeignKey
ALTER TABLE `d_payment_type` ADD CONSTRAINT `d_payment_type_d_purchase_id_fkey` FOREIGN KEY (`d_purchase_id`) REFERENCES `d_purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `d_purchase_customer_payment` ADD CONSTRAINT `d_purchase_customer_payment_d_purchase_id_fkey` FOREIGN KEY (`d_purchase_id`) REFERENCES `d_purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
