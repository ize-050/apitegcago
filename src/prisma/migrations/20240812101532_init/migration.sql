/*
  Warnings:

  - You are about to drop the column `d_agentcy_id` on the `d_sale_agentcy_file` table. All the data in the column will be lost.
  - Added the required column `d_sale_agent_id` to the `d_sale_agentcy_file` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `d_sale_agentcy_file` DROP FOREIGN KEY `d_sale_agentcy_file_d_agentcy_id_fkey`;

-- AlterTable
ALTER TABLE `d_sale_agentcy_file` DROP COLUMN `d_agentcy_id`,
    ADD COLUMN `d_sale_agent_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `d_sale_agentcy_file` ADD CONSTRAINT `d_sale_agentcy_file_d_sale_agent_id_fkey` FOREIGN KEY (`d_sale_agent_id`) REFERENCES `d_sale_agentcy`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
