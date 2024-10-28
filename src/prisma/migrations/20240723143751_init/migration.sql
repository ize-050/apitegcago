/*
  Warnings:

  - Added the required column `document_power_attorney` to the `document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `document` ADD COLUMN `document_power_attorney` BOOLEAN NOT NULL;
