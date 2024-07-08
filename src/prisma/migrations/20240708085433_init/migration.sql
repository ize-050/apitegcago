-- CreateTable
CREATE TABLE `d_purchase` (
    `id` VARCHAR(191) NOT NULL,
    `book_number` VARCHAR(191) NOT NULL,
    `customer_number` VARCHAR(191) NOT NULL,
    `customer_id` VARCHAR(191) NOT NULL,
    `d_route` VARCHAR(191) NULL,
    `d_transport` VARCHAR(191) NULL,
    `d_term` VARCHAR(191) NULL,
    `d_origin` VARCHAR(191) NULL,
    `d_destination` VARCHAR(191) NULL,
    `d_size_cabinet` VARCHAR(191) NULL,
    `d_weight` VARCHAR(191) NULL,
    `d_address_origin` VARCHAR(191) NULL,
    `d_address_destination` VARCHAR(191) NULL,
    `d_refund_tag` VARCHAR(191) NULL,
    `d_truck` VARCHAR(191) NULL,
    `d_etc` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `d_purchase_book_number_key`(`book_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `d_product` (
    `id` VARCHAR(191) NOT NULL,
    `d_product_name` VARCHAR(191) NULL,
    `d_purchase_id` VARCHAR(191) NOT NULL,
    `review_date` DATETIME(3) NULL,
    `performance_rating` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `d_product_d_purchase_id_key`(`d_purchase_id`),
    INDEX `d_product_d_purchase_id_idx`(`d_purchase_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `d_product_image` (
    `id` VARCHAR(191) NOT NULL,
    `d_product_id` VARCHAR(191) NOT NULL,
    `d_purchase_id` VARCHAR(191) NULL,
    `d_product_image_name` VARCHAR(191) NULL,
    `d_active` BOOLEAN NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `d_product` ADD CONSTRAINT `d_product_d_purchase_id_fkey` FOREIGN KEY (`d_purchase_id`) REFERENCES `d_purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `d_product_image` ADD CONSTRAINT `d_product_image_d_product_id_fkey` FOREIGN KEY (`d_product_id`) REFERENCES `d_product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
