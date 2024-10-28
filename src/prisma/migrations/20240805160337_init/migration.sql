-- CreateTable
CREATE TABLE `d_purchase_log` (
    `id` VARCHAR(191) NOT NULL,
    `d_purchase_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `role_id` VARCHAR(191) NULL,
    `log_type` VARCHAR(191) NULL,
    `log_text` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `d_purchase_log` ADD CONSTRAINT `d_purchase_log_d_purchase_id_fkey` FOREIGN KEY (`d_purchase_id`) REFERENCES `d_purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `d_purchase_log` ADD CONSTRAINT `d_purchase_log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
