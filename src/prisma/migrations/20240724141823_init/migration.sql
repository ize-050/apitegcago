-- DropForeignKey
ALTER TABLE `customer_detail` DROP FOREIGN KEY `customer_detail_cd_group_id_fkey`;

-- AlterTable
ALTER TABLE `customer_detail` MODIFY `cd_group_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `customer_detail` ADD CONSTRAINT `customer_detail_cd_group_id_fkey` FOREIGN KEY (`cd_group_id`) REFERENCES `customer_group`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
