/*
  Warnings:

  - You are about to drop the column `expires_at` on the `auth_sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "auth_sessions" DROP COLUMN "expires_at";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "last_login" TIMESTAMPTZ(6);
