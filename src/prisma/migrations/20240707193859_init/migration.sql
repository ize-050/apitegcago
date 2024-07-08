-- AlterTable
ALTER TABLE `customer_detail` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `customer_emp` ALTER COLUMN `deletedAt` DROP DEFAULT,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `customer_status` ALTER COLUMN `updatedAt` DROP DEFAULT;
