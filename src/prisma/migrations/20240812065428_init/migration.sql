/*
  Warnings:

  - Added the required column `payment_net_balance` to the `payment_purchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payment_purchase` ADD COLUMN `payment_net_balance` VARCHAR(191) NOT NULL;
