-- AlterTable
ALTER TABLE `documentType` ADD COLUMN `type_key` VARCHAR(191) NULL,
    MODIFY `do_name` VARCHAR(191) NULL;
