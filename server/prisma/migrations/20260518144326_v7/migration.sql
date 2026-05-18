-- AlterTable
ALTER TABLE `message` ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `messageType` VARCHAR(191) NOT NULL DEFAULT 'text';
