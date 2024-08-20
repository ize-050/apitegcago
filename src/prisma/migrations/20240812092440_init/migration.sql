-- CreateTable
CREATE TABLE `d_sale_agentcy` (
    `id` VARCHAR(191) NOT NULL,
    `purchase_id` VARCHAR(191) NOT NULL,
    `d_agentcy_id` VARCHAR(191) NOT NULL,
    `status` BOOLEAN NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `d_sale_agentcy_file` (
    `id` VARCHAR(191) NOT NULL,
    `d_agentcy_id` VARCHAR(191) NOT NULL,
    `purchase_id` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `d_sale_agentcy` ADD CONSTRAINT `d_sale_agentcy_d_agentcy_id_fkey` FOREIGN KEY (`d_agentcy_id`) REFERENCES `d_agentcy`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `d_sale_agentcy` ADD CONSTRAINT `d_sale_agentcy_purchase_id_fkey` FOREIGN KEY (`purchase_id`) REFERENCES `d_purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `d_sale_agentcy_file` ADD CONSTRAINT `d_sale_agentcy_file_d_agentcy_id_fkey` FOREIGN KEY (`d_agentcy_id`) REFERENCES `d_sale_agentcy`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
