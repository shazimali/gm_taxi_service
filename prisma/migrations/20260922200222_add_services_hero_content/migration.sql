-- AlterTable
ALTER TABLE `site_settings` ADD COLUMN `servicesHeroDesc` TEXT NULL,
    ADD COLUMN `servicesHeroImage` VARCHAR(191) NULL,
    ADD COLUMN `servicesHeroTag` VARCHAR(191) NOT NULL DEFAULT 'PREMIUM EXECUTIVE TRANSPORTATION',
    ADD COLUMN `servicesHeroTitle` VARCHAR(191) NOT NULL DEFAULT 'Our Luxury Services';
