/*
  Warnings:

  - A unique constraint covering the columns `[customer_id]` on the table `d_purchase` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `d_purchase_customer_id_key` ON `d_purchase`(`customer_id`);

-- AddForeignKey
ALTER TABLE `d_purchase` ADD CONSTRAINT `d_purchase_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer_emp`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
