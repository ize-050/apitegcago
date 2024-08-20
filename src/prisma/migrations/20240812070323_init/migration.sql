/*
  Warnings:

  - Added the required column `payment_currency` to the `payment_purchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payment_purchase` ADD COLUMN `payment_currency` VARCHAR(191) NOT NULL;
