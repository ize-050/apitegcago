/*
  Warnings:

  - You are about to drop the `agentct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `agentct`;

-- CreateTable
CREATE TABLE `agentcy` (
    `id` VARCHAR(191) NOT NULL,
    `agent_name` VARCHAR(191) NOT NULL,
    `agent_phone` VARCHAR(191) NOT NULL,
    `agent_email` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
