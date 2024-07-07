/*
  Warnings:

  - The primary key for the `Customer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Customer` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Customer_email_key` ON `Customer`;

-- AlterTable
ALTER TABLE `Customer` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    DROP COLUMN `email`,
    DROP COLUMN `name`,
    ADD COLUMN `cus_etc` VARCHAR(191) NULL,
    ADD COLUMN `cus_facebook` VARCHAR(191) NULL,
    ADD COLUMN `cus_fullname` VARCHAR(191) NULL,
    ADD COLUMN `cus_line` VARCHAR(191) NULL,
    ADD COLUMN `cus_phone` VARCHAR(191) NULL,
    ADD COLUMN `cus_website` VARCHAR(191) NULL,
    ADD COLUMN `cus_wechat` VARCHAR(191) NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `Customer_detail` (
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

    UNIQUE INDEX `Customer_detail_customer_id_key`(`customer_id`),
    INDEX `Customer_detail_customer_id_idx`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Customer_detail` ADD CONSTRAINT `Customer_detail_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
