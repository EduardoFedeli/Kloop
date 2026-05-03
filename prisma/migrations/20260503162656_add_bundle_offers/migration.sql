-- CreateEnum
CREATE TYPE "BundleOfferStatus" AS ENUM ('PENDING_SELLER', 'PENDING_BUYER', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "bundle_offers" (
    "id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "status" "BundleOfferStatus" NOT NULL DEFAULT 'PENDING_SELLER',
    "listing_total_cents_at_creation" INTEGER NOT NULL,
    "current_total_cents" INTEGER NOT NULL,
    "current_turn_user_id" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "rounds_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bundle_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bundle_offer_items" (
    "id" TEXT NOT NULL,
    "bundle_offer_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "price_cents_at_creation" INTEGER NOT NULL,

    CONSTRAINT "bundle_offer_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bundle_offer_rounds" (
    "id" TEXT NOT NULL,
    "bundle_offer_id" TEXT NOT NULL,
    "round_number" INTEGER NOT NULL,
    "proposed_by" TEXT NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bundle_offer_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bundle_offers_buyer_id_status_idx" ON "bundle_offers"("buyer_id", "status");

-- CreateIndex
CREATE INDEX "bundle_offers_seller_id_status_idx" ON "bundle_offers"("seller_id", "status");

-- CreateIndex
CREATE INDEX "bundle_offers_expires_at_status_idx" ON "bundle_offers"("expires_at", "status");

-- CreateIndex
CREATE INDEX "bundle_offer_rounds_bundle_offer_id_created_at_idx" ON "bundle_offer_rounds"("bundle_offer_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "bundle_offer_rounds_bundle_offer_id_round_number_key" ON "bundle_offer_rounds"("bundle_offer_id", "round_number");

-- AddForeignKey
ALTER TABLE "bundle_offers" ADD CONSTRAINT "bundle_offers_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundle_offers" ADD CONSTRAINT "bundle_offers_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundle_offer_items" ADD CONSTRAINT "bundle_offer_items_bundle_offer_id_fkey" FOREIGN KEY ("bundle_offer_id") REFERENCES "bundle_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundle_offer_items" ADD CONSTRAINT "bundle_offer_items_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundle_offer_rounds" ADD CONSTRAINT "bundle_offer_rounds_bundle_offer_id_fkey" FOREIGN KEY ("bundle_offer_id") REFERENCES "bundle_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundle_offer_rounds" ADD CONSTRAINT "bundle_offer_rounds_proposed_by_fkey" FOREIGN KEY ("proposed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
