-- AlterTable
ALTER TABLE `Contain` ADD COLUMN `type_contain` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Leave` ADD COLUMN `check_price_deposit` BOOLEAN NULL,
    ADD COLUMN `price_deposit` VARCHAR(191) NULL;
