/*
  Warnings:

  - You are about to drop the column `d_currencv` on the `d_agentcy_detail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `d_agentcy_detail` DROP COLUMN `d_currencv`,
    ADD COLUMN `d_currency` VARCHAR(191) NULL;
