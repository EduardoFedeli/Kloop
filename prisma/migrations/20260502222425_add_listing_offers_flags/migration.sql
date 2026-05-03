-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "accepts_offers" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "ideal_price_max_cents" INTEGER,
ADD COLUMN     "ideal_price_min_cents" INTEGER,
ADD COLUMN     "smart_price_enabled" BOOLEAN NOT NULL DEFAULT false;
