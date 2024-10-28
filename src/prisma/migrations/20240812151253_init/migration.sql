-- CreateTable
CREATE TABLE `d_confirm_purchase` (
    `id` VARCHAR(191) NOT NULL,
    `d_purchase_id` VARCHAR(191) NOT NULL,
    `type_confirm` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `d_confirm_purchase_file` (
    `id` VARCHAR(191) NOT NULL,
    `d_confirm_id` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `d_confirm_purchase` ADD CONSTRAINT `d_confirm_purchase_d_purchase_id_fkey` FOREIGN KEY (`d_purchase_id`) REFERENCES `d_purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `d_confirm_purchase_file` ADD CONSTRAINT `d_confirm_purchase_file_d_confirm_id_fkey` FOREIGN KEY (`d_confirm_id`) REFERENCES `d_confirm_purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
