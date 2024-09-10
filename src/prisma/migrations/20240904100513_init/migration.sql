-- AlterTable
ALTER TABLE `d_purchase` ADD COLUMN `date_cabinet` DATETIME(3) NULL,
    ADD COLUMN `link_d_destination` VARCHAR(191) NULL,
    ADD COLUMN `link_d_origin` VARCHAR(191) NULL;
