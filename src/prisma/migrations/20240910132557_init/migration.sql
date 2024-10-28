-- AlterTable
ALTER TABLE `Cs_document` MODIFY `document_invoice_date` VARCHAR(191) NULL,
    MODIFY `document_packinglist` VARCHAR(191) NULL,
    MODIFY `document_draft` VARCHAR(191) NULL,
    MODIFY `document_etc` VARCHAR(191) NULL,
    MODIFY `document_draft_invoice` VARCHAR(191) NULL,
    MODIFY `document_draft_bl` VARCHAR(191) NULL,
    MODIFY `document_master_bl` VARCHAR(191) NULL;
