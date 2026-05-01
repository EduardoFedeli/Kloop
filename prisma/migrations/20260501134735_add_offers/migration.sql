-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('PENDING_SELLER', 'PENDING_BUYER', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING_SELLER',
    "listing_price_cents_at_creation" INTEGER NOT NULL,
    "current_price_cents" INTEGER NOT NULL,
    "current_turn_user_id" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "rounds_count" INTEGER NOT NULL DEFAULT 1,
    "transaction_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_rounds" (
    "id" TEXT NOT NULL,
    "offer_id" TEXT NOT NULL,
    "round_number" INTEGER NOT NULL,
    "proposed_by" TEXT NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offer_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "view_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "view_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "offers_transaction_id_key" ON "offers"("transaction_id");

-- CreateIndex
CREATE INDEX "offers_listing_id_status_idx" ON "offers"("listing_id", "status");

-- CreateIndex
CREATE INDEX "offers_buyer_id_status_idx" ON "offers"("buyer_id", "status");

-- CreateIndex
CREATE INDEX "offers_seller_id_status_idx" ON "offers"("seller_id", "status");

-- CreateIndex
CREATE INDEX "offers_expires_at_status_idx" ON "offers"("expires_at", "status");

-- CreateIndex
CREATE INDEX "offer_rounds_offer_id_created_at_idx" ON "offer_rounds"("offer_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "offer_rounds_offer_id_round_number_key" ON "offer_rounds"("offer_id", "round_number");

-- CreateIndex
CREATE INDEX "view_history_user_id_viewed_at_idx" ON "view_history"("user_id", "viewed_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "view_history_user_id_listing_id_key" ON "view_history"("user_id", "listing_id");

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_rounds" ADD CONSTRAINT "offer_rounds_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_rounds" ADD CONSTRAINT "offer_rounds_proposed_by_fkey" FOREIGN KEY ("proposed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "view_history" ADD CONSTRAINT "view_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "view_history" ADD CONSTRAINT "view_history_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
