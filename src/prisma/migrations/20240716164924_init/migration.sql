-- DropForeignKey
ALTER TABLE `d_purchase` DROP FOREIGN KEY `d_purchase_customer_id_fkey`;

-- AddForeignKey
ALTER TABLE `d_purchase` ADD CONSTRAINT `d_purchase_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
