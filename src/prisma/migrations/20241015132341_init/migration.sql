/*
  Warnings:

  - You are about to drop the column `date_d_deposit` on the `cs_return_cabinet` table. All the data in the column will be lost.
  - You are about to drop the column `date_deposit` on the `cs_return_cabinet` table. All the data in the column will be lost.
  - You are about to drop the column `date_request` on the `cs_return_cabinet` table. All the data in the column will be lost.
  - You are about to drop the column `deposit` on the `cs_return_cabinet` table. All the data in the column will be lost.
  - You are about to drop the column `price_cabinet` on the `cs_return_cabinet` table. All the data in the column will be lost.
  - You are about to drop the column `price_d_deposit` on the `cs_return_cabinet` table. All the data in the column will be lost.
  - You are about to drop the column `return_deposit` on the `cs_return_cabinet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `cs_return_cabinet` DROP COLUMN `date_d_deposit`,
    DROP COLUMN `date_deposit`,
    DROP COLUMN `date_request`,
    DROP COLUMN `deposit`,
    DROP COLUMN `price_cabinet`,
    DROP COLUMN `price_d_deposit`,
    DROP COLUMN `return_deposit`,
    ADD COLUMN `date_request_return` VARCHAR(191) NULL,
    ADD COLUMN `price_deposit` VARCHAR(191) NULL,
    ADD COLUMN `price_repair_cabinet` VARCHAR(191) NULL,
    ADD COLUMN `price_request_return` VARCHAR(191) NULL,
    ADD COLUMN `price_return_cabinet` VARCHAR(191) NULL,
    ADD COLUMN `request_return` BOOLEAN NULL;
