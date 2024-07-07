/*
  Warnings:

  - You are about to drop the column `cd_asddress` on the `customer_detail` table. All the data in the column will be lost.
  - Added the required column `cd_address` to the `customer_detail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `customer_detail` DROP COLUMN `cd_asddress`,
    ADD COLUMN `cd_address` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `customer_status` (
    `id` VARCHAR(191) NOT NULL,
    `customer_id` VARCHAR(191) NOT NULL,
    `cus_status` VARCHAR(191) NOT NULL,
    `active` VARCHAR(191) NOT NULL,

    INDEX `customer_status_customer_id_idx`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_emp` (
    `id` VARCHAR(191) NOT NULL,
    `customer_id` VARCHAR(191) NOT NULL,
    `cus_status` VARCHAR(191) NOT NULL,
    `active` VARCHAR(191) NOT NULL,

    INDEX `customer_emp_customer_id_idx`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `customer_status` ADD CONSTRAINT `customer_status_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_emp` ADD CONSTRAINT `customer_emp_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
