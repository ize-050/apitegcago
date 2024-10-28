/*
  Warnings:

  - You are about to drop the column `d_address_destination_location` on the `d_purchase` table. All the data in the column will be lost.
  - You are about to drop the column `d_address_origin_location` on the `d_purchase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `d_purchase` DROP COLUMN `d_address_destination_location`,
    DROP COLUMN `d_address_origin_location`,
    ADD COLUMN `d_address_destination_la` VARCHAR(191) NULL,
    ADD COLUMN `d_address_destination_long` VARCHAR(191) NULL,
    ADD COLUMN `d_address_origin_la` VARCHAR(191) NULL,
    ADD COLUMN `d_address_origin_long` VARCHAR(191) NULL;
