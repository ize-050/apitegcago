-- CreateTable
CREATE TABLE `Leave` (
    `id` VARCHAR(191) NOT NULL,
    `cs_purchase_id` VARCHAR(191) NOT NULL,
    `date_hbl` VARCHAR(191) NULL,
    `date_original_fe` VARCHAR(191) NULL,
    `date_surrender` VARCHAR(191) NULL,
    `date_enter_doc` VARCHAR(191) NULL,
    `file_enter_doc` VARCHAR(191) NULL,
    `date_payment_do` VARCHAR(191) NULL,
    `amount_payment_do` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Leave_cs_purchase_id_key`(`cs_purchase_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Leavefile` (
    `id` VARCHAR(191) NOT NULL,
    `leave_id` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `Leavefile_leave_id_fkey`(`leave_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Leave` ADD CONSTRAINT `Leave_cs_purchase_id_fkey` FOREIGN KEY (`cs_purchase_id`) REFERENCES `CS_Purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Leavefile` ADD CONSTRAINT `Leavefile_leave_id_fkey` FOREIGN KEY (`leave_id`) REFERENCES `Leave`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
