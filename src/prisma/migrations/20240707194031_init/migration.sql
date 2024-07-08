-- AlterTable
ALTER TABLE `customer` MODIFY `deletedAt` DATETIME(3) NULL,
    MODIFY `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `customer_detail` MODIFY `deletedAt` DATETIME(3) NULL,
    MODIFY `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `customer_emp` MODIFY `deletedAt` DATETIME(3) NULL,
    MODIFY `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `customer_status` MODIFY `deletedAt` DATETIME(3) NULL,
    MODIFY `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `roles` MODIFY `deletedAt` DATETIME(3) NULL,
    MODIFY `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `deletedAt` DATETIME(3) NULL,
    MODIFY `updatedAt` DATETIME(3) NULL;
