/*
  Warnings:

  - You are about to alter the column `d_nettotal` on the `d_agentcy_detail` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `d_net_balance` on the `d_agentcy_detail` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `d_agentcy_detail` MODIFY `d_nettotal` INTEGER NULL,
    MODIFY `d_net_balance` INTEGER NULL;
