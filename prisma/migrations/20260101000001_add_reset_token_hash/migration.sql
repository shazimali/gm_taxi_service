-- AlterTable
ALTER TABLE `admins` ADD COLUMN `resetTokenExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `resetTokenHash` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `passengers` ADD COLUMN `resetTokenExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `resetTokenHash` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `admins_resetTokenHash_key` ON `admins`(`resetTokenHash`);

-- CreateIndex
CREATE UNIQUE INDEX `passengers_resetTokenHash_key` ON `passengers`(`resetTokenHash`);

