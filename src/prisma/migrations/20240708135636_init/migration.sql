/*
  Warnings:

  - Added the required column `Cabinet_deposit` to the `document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_ARRIVAL_NOTICE` to the `document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_BILL_OF_LADING` to the `document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_DraftBL` to the `document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_DraftFE` to the `document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_FE` to the `document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_INV` to the `document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_Invpick` to the `document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_PL` to the `document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_Slip` to the `document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_card` to the `document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_certificate` to the `document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_customs_receipt` to the `document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_do` to the `document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_draft` to the `document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_etc` to the `document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_hairy` to the `document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_so` to the `document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_tracking` to the `document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_world20` to the `document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `document` ADD COLUMN `Cabinet_deposit` BOOLEAN NOT NULL,
    ADD COLUMN `document_ARRIVAL_NOTICE` BOOLEAN NOT NULL,
    ADD COLUMN `document_BILL_OF_LADING` BOOLEAN NOT NULL,
    ADD COLUMN `document_DraftBL` BOOLEAN NOT NULL,
    ADD COLUMN `document_DraftFE` BOOLEAN NOT NULL,
    ADD COLUMN `document_FE` BOOLEAN NOT NULL,
    ADD COLUMN `document_INV` BOOLEAN NOT NULL,
    ADD COLUMN `document_Invpick` BOOLEAN NOT NULL,
    ADD COLUMN `document_PL` BOOLEAN NOT NULL,
    ADD COLUMN `document_Slip` BOOLEAN NOT NULL,
    ADD COLUMN `document_card` BOOLEAN NOT NULL,
    ADD COLUMN `document_certificate` BOOLEAN NOT NULL,
    ADD COLUMN `document_customs_receipt` BOOLEAN NOT NULL,
    ADD COLUMN `document_do` BOOLEAN NOT NULL,
    ADD COLUMN `document_draft` BOOLEAN NOT NULL,
    ADD COLUMN `document_etc` BOOLEAN NOT NULL,
    ADD COLUMN `document_hairy` BOOLEAN NOT NULL,
    ADD COLUMN `document_so` BOOLEAN NOT NULL,
    ADD COLUMN `document_tracking` BOOLEAN NOT NULL,
    ADD COLUMN `document_world20` BOOLEAN NOT NULL;
