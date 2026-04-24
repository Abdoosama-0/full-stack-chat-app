-- AlterTable
ALTER TABLE `chatmember` ADD COLUMN `hidden` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lastSeenMessageId` BIGINT NULL;
