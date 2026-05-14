-- AlterTable
ALTER TABLE `message` ADD COLUMN `replyOnId` BIGINT NULL;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_replyOnId_fkey` FOREIGN KEY (`replyOnId`) REFERENCES `Message`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
