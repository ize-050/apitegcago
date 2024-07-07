/*
  Warnings:

  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Customer_detail` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Customer_detail` DROP FOREIGN KEY `Customer_detail_customer_id_fkey`;

-- DropTable
DROP TABLE `Customer`;

-- DropTable
DROP TABLE `Customer_detail`;

-- CreateTable
CREATE TABLE `customer` (
    `id` VARCHAR(191) NOT NULL,
    `cus_fullname` VARCHAR(191) NULL,
    `cus_phone` VARCHAR(191) NULL,
    `cus_line` VARCHAR(191) NULL,
    `cus_website` VARCHAR(191) NULL,
    `cus_etc` VARCHAR(191) NULL,
    `cus_facebook` VARCHAR(191) NULL,
    `cus_wechat` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_detail` (
    `id` VARCHAR(191) NOT NULL,
    `customer_id` VARCHAR(191) NOT NULL,
    `cd_consider` VARCHAR(191) NOT NULL,
    `cd_typeinout` VARCHAR(191) NOT NULL,
    `cd_custype` VARCHAR(191) NOT NULL,
    `cd_cusservice` VARCHAR(191) NOT NULL,
    `cd_channels` VARCHAR(191) NOT NULL,
    `cd_num` INTEGER NOT NULL,
    `cd_capital` VARCHAR(191) NOT NULL,
    `cd_emp` VARCHAR(191) NOT NULL,
    `cd_shareholders` VARCHAR(191) NOT NULL,
    `cd_asddress` VARCHAR(191) NOT NULL,
    `cd_num_saka` VARCHAR(191) NOT NULL,
    `cd_frequency` VARCHAR(191) NOT NULL,
    `cd_leader` VARCHAR(191) NOT NULL,
    `cd_priority` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `customer_detail_customer_id_key`(`customer_id`),
    INDEX `customer_detail_customer_id_idx`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `customer_detail` ADD CONSTRAINT `customer_detail_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
