-- CreateTable
CREATE TABLE `cs_inspection` (
    `id` VARCHAR(191) NOT NULL,
    `cs_purchase_id` VARCHAR(191) NOT NULL,
    `shipping` VARCHAR(191) NULL,
    `date_release` VARCHAR(191) NULL,
    `date_do` VARCHAR(191) NULL,
    `date_card` VARCHAR(191) NULL,
    `date_return_document` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `cs_inspection_cs_purchase_id_key`(`cs_purchase_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cs_inspection_file` (
    `id` VARCHAR(191) NOT NULL,
    `cs_inspection_id` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `file_key` VARCHAR(191) NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cs_wait_destination` (
    `id` VARCHAR(191) NOT NULL,
    `cs_purchase_id` VARCHAR(191) NOT NULL,
    `cs_inspection_id` VARCHAR(191) NOT NULL,
    `date_receiving_cabinet` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `cs_wait_destination_cs_purchase_id_key`(`cs_purchase_id`),
    UNIQUE INDEX `cs_wait_destination_cs_inspection_id_key`(`cs_inspection_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cs_wait_destination_file` (
    `id` VARCHAR(191) NOT NULL,
    `wait_destination_id` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cs_already_sent` (
    `id` VARCHAR(191) NOT NULL,
    `cs_purchase_id` VARCHAR(191) NOT NULL,
    `date_out_arrival` VARCHAR(191) NULL,
    `etc` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `cs_already_sent_cs_purchase_id_key`(`cs_purchase_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cs_already_sent_file` (
    `id` VARCHAR(191) NOT NULL,
    `cs_already_sent_id` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cs_return_cabinet` (
    `id` VARCHAR(191) NOT NULL,
    `cs_purchase_id` VARCHAR(191) NOT NULL,
    `date_return_cabinet` VARCHAR(191) NULL,
    `cabinet` BOOLEAN NULL,
    `date_cabinet` VARCHAR(191) NULL,
    `return_deposit` BOOLEAN NULL,
    `date_deposit` VARCHAR(191) NULL,
    `date_request` VARCHAR(191) NULL,
    `return_cabinet` BOOLEAN NULL,
    `price_cabinet` VARCHAR(191) NULL,
    `deposit` BOOLEAN NULL,
    `date_d_deposit` VARCHAR(191) NULL,
    `price_d_deposit` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `cs_return_cabinet_cs_purchase_id_key`(`cs_purchase_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cs_return_cabinet_file` (
    `id` VARCHAR(191) NOT NULL,
    `return_cabinet_id` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cs_inspection` ADD CONSTRAINT `cs_inspection_cs_purchase_id_fkey` FOREIGN KEY (`cs_purchase_id`) REFERENCES `CS_Purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cs_inspection_file` ADD CONSTRAINT `cs_inspection_file_cs_inspection_id_fkey` FOREIGN KEY (`cs_inspection_id`) REFERENCES `cs_inspection`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cs_wait_destination` ADD CONSTRAINT `cs_wait_destination_cs_purchase_id_fkey` FOREIGN KEY (`cs_purchase_id`) REFERENCES `CS_Purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cs_wait_destination` ADD CONSTRAINT `cs_wait_destination_cs_inspection_id_fkey` FOREIGN KEY (`cs_inspection_id`) REFERENCES `cs_inspection`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cs_wait_destination_file` ADD CONSTRAINT `cs_wait_destination_file_wait_destination_id_fkey` FOREIGN KEY (`wait_destination_id`) REFERENCES `cs_wait_destination`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cs_already_sent` ADD CONSTRAINT `cs_already_sent_cs_purchase_id_fkey` FOREIGN KEY (`cs_purchase_id`) REFERENCES `CS_Purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cs_already_sent_file` ADD CONSTRAINT `cs_already_sent_file_cs_already_sent_id_fkey` FOREIGN KEY (`cs_already_sent_id`) REFERENCES `cs_already_sent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cs_return_cabinet` ADD CONSTRAINT `cs_return_cabinet_cs_purchase_id_fkey` FOREIGN KEY (`cs_purchase_id`) REFERENCES `CS_Purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cs_return_cabinet_file` ADD CONSTRAINT `cs_return_cabinet_file_return_cabinet_id_fkey` FOREIGN KEY (`return_cabinet_id`) REFERENCES `cs_return_cabinet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
