-- CreateTable
CREATE TABLE `payment_purchase` (
    `id` VARCHAR(191) NOT NULL,
    `d_purchase_id` VARCHAR(191) NOT NULL,
    `payment_type` VARCHAR(191) NOT NULL,
    `payment_name` VARCHAR(191) NOT NULL,
    `payment_date` DATETIME(3) NOT NULL,
    `payment_price` VARCHAR(191) NOT NULL,
    `payment_discount` VARCHAR(191) NOT NULL,
    `payment_total_price` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `payment_purchase` ADD CONSTRAINT `payment_purchase_d_purchase_id_fkey` FOREIGN KEY (`d_purchase_id`) REFERENCES `d_purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
