-- CreateEnum
CREATE TYPE "GenderPreference" AS ENUM ('FEMININE', 'MASCULINE', 'BOTH');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "gender_preference" "GenderPreference";
