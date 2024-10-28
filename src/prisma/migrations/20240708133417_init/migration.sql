-- CreateTable
CREATE TABLE `document` (
    `id` VARCHAR(191) NOT NULL,
    `document_type_id` VARCHAR(191) NOT NULL,
    `documennt_type` VARCHAR(191) NOT NULL,
    `document_key` ENUM('Document', 'License') NOT NULL,
    `document_name` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `documentType` ADD CONSTRAINT `documentType_type_master_id_fkey` FOREIGN KEY (`type_master_id`) REFERENCES `typeMaster`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document` ADD CONSTRAINT `document_document_type_id_fkey` FOREIGN KEY (`document_type_id`) REFERENCES `documentType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
