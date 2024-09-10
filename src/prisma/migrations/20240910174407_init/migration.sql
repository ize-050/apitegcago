/*
  Warnings:

  - You are about to drop the column `file_key` on the `cs_inspection_file` table. All the data in the column will be lost.
  - Added the required column `key` to the `cs_inspection_file` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cs_inspection_file` DROP COLUMN `file_key`,
    ADD COLUMN `key` VARCHAR(191) NOT NULL;
