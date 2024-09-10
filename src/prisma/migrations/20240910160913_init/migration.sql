-- CreateTable
CREATE TABLE `waitrelease` (
    `id` VARCHAR(191) NOT NULL,
    `cs_purchase_id` VARCHAR(191) NOT NULL,
    `date_planing` VARCHAR(191) NULL,
    `date_receive` VARCHAR(191) NULL,
    `dem_free_time` VARCHAR(191) NULL,
    `demurrage_dem_date` VARCHAR(191) NULL,
    `detention_det_date` VARCHAR(191) NULL,
    `license_plate` VARCHAR(191) NULL,
    `location_exchange` VARCHAR(191) NULL,
    `phone_number` VARCHAR(191) NULL,
    `terminal_release` VARCHAR(191) NULL,
    `type_car` VARCHAR(191) NULL,
    `company_car` VARCHAR(191) NULL,
    `det_free_time` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `waitrelease_cs_purchase_id_key`(`cs_purchase_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `waitrelease_file` (
    `id` VARCHAR(191) NOT NULL,
    `waitrelease_id` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `waitrelease` ADD CONSTRAINT `waitrelease_cs_purchase_id_fkey` FOREIGN KEY (`cs_purchase_id`) REFERENCES `CS_Purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `waitrelease_file` ADD CONSTRAINT `waitrelease_file_waitrelease_id_fkey` FOREIGN KEY (`waitrelease_id`) REFERENCES `waitrelease`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
