/*
  Warnings:

  - You are about to drop the column `gaji_pokok` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `no_hp` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `passwordresettoken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `passwordresettoken` DROP FOREIGN KEY `PasswordResetToken_user_id_fkey`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `gaji_pokok`,
    DROP COLUMN `no_hp`,
    DROP COLUMN `token`,
    ADD COLUMN `basic_salary` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `phone_number` VARCHAR(15) NULL;

-- DropTable
DROP TABLE `passwordresettoken`;

-- CreateTable
CREATE TABLE `TokenAuth` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `token_type` ENUM('REFRESH', 'RESET_PASSWORD') NOT NULL,
    `expired_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `TokenAuth_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TokenAuth` ADD CONSTRAINT `TokenAuth_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
