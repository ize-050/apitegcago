/*
  Warnings:

  - You are about to alter the column `payment_total_price` on the `payment_purchase` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `payment_net_balance` on the `payment_purchase` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `payment_purchase` MODIFY `payment_total_price` INTEGER NOT NULL,
    MODIFY `payment_net_balance` INTEGER NOT NULL;
