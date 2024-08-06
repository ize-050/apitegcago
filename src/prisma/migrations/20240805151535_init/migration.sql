-- DropForeignKey
ALTER TABLE `d_purchase_status` DROP FOREIGN KEY `d_purchase_status_status_key_fkey`;

-- AddForeignKey
ALTER TABLE `d_purchase_status` ADD CONSTRAINT `d_purchase_status_status_key_fkey` FOREIGN KEY (`status_key`) REFERENCES `master_status`(`status_key`) ON DELETE RESTRICT ON UPDATE CASCADE;
