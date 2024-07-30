-- CreateTable
CREATE TABLE `d_document_file` (
    `id` VARCHAR(191) NOT NULL,
    `d_document_id` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agentct` (
    `id` VARCHAR(191) NOT NULL,
    `agent_name` VARCHAR(191) NOT NULL,
    `agent_phone` VARCHAR(191) NOT NULL,
    `agent_email` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `d_agentcy` (
    `id` VARCHAR(191) NOT NULL,
    `d_purchase_id` VARCHAR(191) NOT NULL,
    `agentcy_id` VARCHAR(191) NOT NULL,
    `status` BOOLEAN NULL DEFAULT false,
    `agent_boat` VARCHAR(191) NULL,
    `agentcy_tit` VARCHAR(191) NULL,
    `agentcy_etd` VARCHAR(191) NULL,
    `agentcy_eta` VARCHAR(191) NULL,
    `agentcy_etc` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `d_agentcy_detail` (
    `id` VARCHAR(191) NOT NULL,
    `d_agentcy_id` VARCHAR(191) NOT NULL,
    `d_purchase_id` VARCHAR(191) NOT NULL,
    `d_type` VARCHAR(191) NULL,
    `d_type_text` VARCHAR(191) NULL,
    `d_price` VARCHAR(191) NULL,
    `d_currencv` VARCHAR(191) NULL,
    `d_nettotal` VARCHAR(191) NULL,
    `d_discount` VARCHAR(191) NULL,
    `d_net_balance` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `d_agentcy_file` (
    `id` VARCHAR(191) NOT NULL,
    `d_agentcy_id` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `d_document_file` ADD CONSTRAINT `d_document_file_d_document_id_fkey` FOREIGN KEY (`d_document_id`) REFERENCES `d_document`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `d_agentcy` ADD CONSTRAINT `d_agentcy_d_purchase_id_fkey` FOREIGN KEY (`d_purchase_id`) REFERENCES `d_purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `d_agentcy_detail` ADD CONSTRAINT `d_agentcy_detail_d_agentcy_id_fkey` FOREIGN KEY (`d_agentcy_id`) REFERENCES `d_agentcy`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `d_agentcy_file` ADD CONSTRAINT `d_agentcy_file_d_agentcy_id_fkey` FOREIGN KEY (`d_agentcy_id`) REFERENCES `d_agentcy`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
