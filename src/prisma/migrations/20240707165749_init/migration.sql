/*
  Warnings:

  - Added the required column `user_id` to the `customer_emp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `customer_emp` ADD COLUMN `user_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `customer_emp` ADD CONSTRAINT `customer_emp_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
