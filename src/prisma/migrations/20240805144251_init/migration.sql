-- CreateTable
CREATE TABLE `master_status` (
    `id` VARCHAR(191) NOT NULL,
    `status_key` VARCHAR(191) NOT NULL,
    `status_name` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `master_status_status_key_key`(`status_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
