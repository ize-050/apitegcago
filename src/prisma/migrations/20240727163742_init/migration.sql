-- AlterTable
ALTER TABLE `d_purchase` MODIFY `customer_id` VARCHAR(191) NOT NULL DEFAULT '';
ALTER TABLE `d_purchase` DROP KEY d_purchase_customer_id_key;
