/*
  Warnings:

  - You are about to drop the `d_status` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cd_group_id]` on the table `customer_detail` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cd_group_id` to the `customer_detail` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `d_status` DROP FOREIGN KEY `d_status_customer_id_fkey`;

-- AlterTable
ALTER TABLE `customer_detail` ADD COLUMN `cd_group_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `d_product_image` ADD COLUMN `d_product_type` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `d_status`;

-- CreateTable
CREATE TABLE `customer_group` (
    `id` VARCHAR(191) NOT NULL,
    `group_name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `d_purchase_status` (
    `id` VARCHAR(191) NOT NULL,
    `purchase_id` VARCHAR(191) NOT NULL,
    `status_name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `active` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `d_purchase_emp` (
    `id` VARCHAR(191) NOT NULL,
    `d_purchase_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `d_purchase_emp_d_purchase_id_idx`(`d_purchase_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `customer_detail_cd_group_id_key` ON `customer_detail`(`cd_group_id`);

-- CreateIndex
CREATE INDEX `customer_detail_customer_id_cd_group_id_idx` ON `customer_detail`(`customer_id`, `cd_group_id`);

-- AddForeignKey
ALTER TABLE `customer_detail` ADD CONSTRAINT `customer_detail_cd_group_id_fkey` FOREIGN KEY (`cd_group_id`) REFERENCES `customer_group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `d_purchase_status` ADD CONSTRAINT `d_purchase_status_purchase_id_fkey` FOREIGN KEY (`purchase_id`) REFERENCES `d_purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `d_purchase_emp` ADD CONSTRAINT `d_purchase_emp_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `d_purchase_emp` ADD CONSTRAINT `d_purchase_emp_d_purchase_id_fkey` FOREIGN KEY (`d_purchase_id`) REFERENCES `d_purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
