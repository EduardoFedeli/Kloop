-- AlterEnum
ALTER TYPE "BoostType" ADD VALUE 'MEGAPHONE';

-- DropForeignKey
ALTER TABLE "store_boosts" DROP CONSTRAINT "store_boosts_store_id_fkey";

-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "is_megafonado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_turbinado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "megafonado_until" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "store_boosts" ADD COLUMN     "user_id" TEXT,
ALTER COLUMN "store_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "subscription_plans" ADD COLUMN     "megaphones_per_week" INTEGER NOT NULL DEFAULT 5;

-- AlterTable
ALTER TABLE "user_subscriptions" ADD COLUMN     "extra_megaphones_balance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "megaphones_used_this_week" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "megaphones_week_reset_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "store_boosts_user_id_idx" ON "store_boosts"("user_id");

-- AddForeignKey
ALTER TABLE "store_boosts" ADD CONSTRAINT "store_boosts_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_boosts" ADD CONSTRAINT "store_boosts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
