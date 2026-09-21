-- CreateTable
CREATE TABLE `processed_stripe_events` (
    `id` VARCHAR(191) NOT NULL,
    `stripeEventId` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `processedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `processed_stripe_events_stripeEventId_key`(`stripeEventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admins` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `tokenVersion` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `admins_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `services` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `tagline` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `fullDetails` TEXT NULL,
    `image` VARCHAR(191) NULL,
    `features` TEXT NULL,
    `benefits` TEXT NULL,
    `iconName` VARCHAR(191) NOT NULL DEFAULT 'Car',
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `services_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicles` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'Executive',
    `model` VARCHAR(191) NOT NULL DEFAULT '',
    `tagline` VARCHAR(191) NULL,
    `passengerCapacity` INTEGER NOT NULL DEFAULT 4,
    `luggageCapacity` INTEGER NOT NULL DEFAULT 3,
    `rateHourly` DOUBLE NULL,
    `baseFare` DOUBLE NULL,
    `baseMiles` DOUBLE NULL,
    `perMileRate` DOUBLE NULL,
    `description` TEXT NULL,
    `image` VARCHAR(191) NULL,
    `features` TEXT NULL,
    `amenities` TEXT NULL,
    `ctaType` VARCHAR(191) NOT NULL DEFAULT 'both',
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `vehicles_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `passengers` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `stripeCustomerId` VARCHAR(191) NULL,
    `tokenVersion` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `passengers_email_key`(`email`),
    UNIQUE INDEX `passengers_stripeCustomerId_key`(`stripeCustomerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` VARCHAR(191) NOT NULL,
    `confirmationNumber` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `serviceType` VARCHAR(191) NOT NULL,
    `vehicleSlug` VARCHAR(191) NULL,
    `pickupLocation` VARCHAR(191) NOT NULL,
    `dropoffLocation` VARCHAR(191) NULL,
    `stops` TEXT NULL,
    `pickupDate` VARCHAR(191) NOT NULL,
    `pickupTime` VARCHAR(191) NOT NULL,
    `passengers` INTEGER NOT NULL DEFAULT 1,
    `luggage` INTEGER NOT NULL DEFAULT 1,
    `flightNumber` VARCHAR(191) NULL,
    `specialRequests` TEXT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `passengerId` VARCHAR(191) NULL,
    `stripePaymentIntentId` VARCHAR(191) NULL,
    `stripeCheckoutSessionId` VARCHAR(191) NULL,
    `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `estimatedPrice` DOUBLE NULL,
    `fareMode` VARCHAR(191) NULL,
    `tipPercent` DOUBLE NULL,
    `tipAmount` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `bookings_confirmationNumber_key`(`confirmationNumber`),
    UNIQUE INDEX `bookings_stripePaymentIntentId_key`(`stripePaymentIntentId`),
    UNIQUE INDEX `bookings_stripeCheckoutSessionId_key`(`stripeCheckoutSessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site_settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `phoneDisplay` VARCHAR(191) NOT NULL DEFAULT '(617) 784-0264',
    `phoneTel` VARCHAR(191) NOT NULL DEFAULT '16177840264',
    `dispatchEmail` VARCHAR(191) NOT NULL DEFAULT 'info@gmlimoservices.com',
    `serviceAddress` VARCHAR(191) NOT NULL DEFAULT 'Boston, Massachusetts, USA',
    `heroTitleGold` VARCHAR(191) NOT NULL DEFAULT 'Boston Luxury Chauffeur',
    `heroTitleMain` VARCHAR(191) NOT NULL DEFAULT '— Logan Airport Car Service',
    `heroSubtitle` VARCHAR(191) NOT NULL DEFAULT 'Elite Corporate Travel, Private Event Transportation & Logan Airport Transfers',
    `locationsHeroTitle` VARCHAR(191) NOT NULL DEFAULT 'Our Service Locations',
    `locationsHeroSubtitle` VARCHAR(191) NOT NULL DEFAULT 'Luxury Executive Transport Across the Greater Area',
    `locationsHeroImage` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `locations` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `locations_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `airport_travel_rates` (
    `id` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `distance` VARCHAR(191) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `price` VARCHAR(191) NULL,
    `pickupZone` VARCHAR(191) NOT NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_passengerId_fkey` FOREIGN KEY (`passengerId`) REFERENCES `passengers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

