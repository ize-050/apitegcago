-- CreateTable
CREATE TABLE `CS_Purchase` (
    `id` VARCHAR(191) NOT NULL,
    `d_purchase_id` VARCHAR(191) NOT NULL,
    `status_key` VARCHAR(191) NULL,
    `status_name` VARCHAR(191) NULL,
    `status_active` BOOLEAN NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bookcabinet` (
    `id` VARCHAR(191) NOT NULL,
    `cs_purchase_id` VARCHAR(191) NOT NULL,
    `date_receiving` DATETIME(3) NULL,
    `date_booking` DATETIME(3) NULL,
    `agentcy_id` VARCHAR(191) NULL,
    `agentcy_etc` VARCHAR(191) NULL,
    `date_entering` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Bookcabinet_cs_purchase_id_key`(`cs_purchase_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bookcabinet_picture` (
    `id` VARCHAR(191) NOT NULL,
    `bookcabinet_id` VARCHAR(191) NOT NULL,
    `picture_name` VARCHAR(191) NOT NULL,
    `picture_path` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Receive` (
    `id` VARCHAR(191) NOT NULL,
    `cs_purchase_id` VARCHAR(191) NOT NULL,
    `date_booking` DATETIME(3) NULL,
    `so_no` VARCHAR(191) NULL,
    `container_no` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Receive_cs_purchase_id_key`(`cs_purchase_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Receive_picture` (
    `id` VARCHAR(191) NOT NULL,
    `receive_id` VARCHAR(191) NOT NULL,
    `picture_name` VARCHAR(191) NOT NULL,
    `picture_path` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contain` (
    `id` VARCHAR(191) NOT NULL,
    `cs_purchase_id` VARCHAR(191) NOT NULL,
    `date_booking` DATETIME(3) NULL,
    `carbon_total` VARCHAR(191) NULL,
    `cmb_total` VARCHAR(191) NULL,
    `nw_total` VARCHAR(191) NULL,
    `gw_total` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Contain_cs_purchase_id_key`(`cs_purchase_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contain_product` (
    `id` VARCHAR(191) NOT NULL,
    `contain_id` VARCHAR(191) NOT NULL,
    `product_name` VARCHAR(191) NOT NULL,
    `product_hscode` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contain_picture` (
    `id` VARCHAR(191) NOT NULL,
    `contain_id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `picture_name` VARCHAR(191) NOT NULL,
    `picture_path` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cs_document` (
    `id` VARCHAR(191) NOT NULL,
    `cs_purchase_id` VARCHAR(191) NOT NULL,
    `document_invoice_date` DATETIME(3) NULL,
    `document_packinglist` DATETIME(3) NULL,
    `document_draft` DATETIME(3) NULL,
    `document_etc` DATETIME(3) NULL,
    `document_draft_invoice` DATETIME(3) NULL,
    `document_draft_bl` DATETIME(3) NULL,
    `document_master_bl` DATETIME(3) NULL,

    UNIQUE INDEX `Cs_document_cs_purchase_id_key`(`cs_purchase_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cs_document_file` (
    `id` VARCHAR(191) NOT NULL,
    `cs_document_id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProveDeparture` (
    `id` VARCHAR(191) NOT NULL,
    `cs_purchase_id` VARCHAR(191) NOT NULL,
    `date_etd` DATETIME(3) NULL,
    `date_eta` DATETIME(3) NULL,
    `post_origin` VARCHAR(191) NULL,
    `post_destination` VARCHAR(191) NULL,
    `vessel_name` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `ProveDeparture_cs_purchase_id_key`(`cs_purchase_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CS_Purchase` ADD CONSTRAINT `CS_Purchase_d_purchase_id_fkey` FOREIGN KEY (`d_purchase_id`) REFERENCES `d_purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bookcabinet` ADD CONSTRAINT `Bookcabinet_cs_purchase_id_fkey` FOREIGN KEY (`cs_purchase_id`) REFERENCES `CS_Purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bookcabinet_picture` ADD CONSTRAINT `Bookcabinet_picture_bookcabinet_id_fkey` FOREIGN KEY (`bookcabinet_id`) REFERENCES `Bookcabinet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Receive` ADD CONSTRAINT `Receive_cs_purchase_id_fkey` FOREIGN KEY (`cs_purchase_id`) REFERENCES `CS_Purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Receive_picture` ADD CONSTRAINT `Receive_picture_receive_id_fkey` FOREIGN KEY (`receive_id`) REFERENCES `Receive`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contain` ADD CONSTRAINT `Contain_cs_purchase_id_fkey` FOREIGN KEY (`cs_purchase_id`) REFERENCES `CS_Purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contain_product` ADD CONSTRAINT `Contain_product_contain_id_fkey` FOREIGN KEY (`contain_id`) REFERENCES `Contain`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contain_picture` ADD CONSTRAINT `Contain_picture_contain_id_fkey` FOREIGN KEY (`contain_id`) REFERENCES `Contain`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cs_document` ADD CONSTRAINT `Cs_document_cs_purchase_id_fkey` FOREIGN KEY (`cs_purchase_id`) REFERENCES `CS_Purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cs_document_file` ADD CONSTRAINT `Cs_document_file_cs_document_id_fkey` FOREIGN KEY (`cs_document_id`) REFERENCES `Cs_document`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProveDeparture` ADD CONSTRAINT `ProveDeparture_cs_purchase_id_fkey` FOREIGN KEY (`cs_purchase_id`) REFERENCES `CS_Purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
