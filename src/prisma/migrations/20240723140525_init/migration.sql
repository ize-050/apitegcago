/*
  Warnings:

  - The values [ETC] on the enum `documentType_do_key` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `documentType` MODIFY `do_key` ENUM('Car', 'BOAT', 'AIR', 'TRAIN', 'TRUCK') NOT NULL;
