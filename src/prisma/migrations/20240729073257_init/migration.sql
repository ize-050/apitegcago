-- AlterTable
ALTER TABLE `d_purchase` ADD COLUMN `d_end_date` DATETIME(3) NULL,
    ADD COLUMN `d_group_work` VARCHAR(191) NULL DEFAULT '',
    ADD COLUMN `d_num_date` VARCHAR(191) NULL;
