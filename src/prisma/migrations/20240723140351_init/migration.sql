/*
  Warnings:

  - You are about to drop the column `type_name` on the `documentType` table. All the data in the column will be lost.
  - Added the required column `do_key` to the `documentType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `do_name` to the `documentType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `documentType` DROP COLUMN `type_name`,
    ADD COLUMN `do_key` ENUM('Car', 'BOAT', 'AIR', 'ETC') NOT NULL,
    ADD COLUMN `do_name` VARCHAR(191) NOT NULL;
