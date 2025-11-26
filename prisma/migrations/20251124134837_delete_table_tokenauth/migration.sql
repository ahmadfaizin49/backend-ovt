/*
  Warnings:

  - You are about to drop the `otpreset` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `otpreset` DROP FOREIGN KEY `OtpReset_user_id_fkey`;

-- AlterTable
ALTER TABLE `tokenauth` MODIFY `token_type` ENUM('REFRESH', 'RESET_PASSWORD', 'OTP_RESET') NOT NULL;

-- DropTable
DROP TABLE `otpreset`;
