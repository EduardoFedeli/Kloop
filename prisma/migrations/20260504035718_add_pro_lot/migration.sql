-- CreateEnum
CREATE TYPE "ProLotStatus" AS ENUM ('PENDING', 'RECEIVED', 'ANALYZING', 'ACTIVE', 'DONE');

-- CreateEnum
CREATE TYPE "ProShippingMethod" AS ENUM ('CORREIOS', 'COLETA');

-- CreateTable
CREATE TABLE "pro_lots" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "ProLotStatus" NOT NULL DEFAULT 'PENDING',
    "shipping_method" "ProShippingMethod" NOT NULL,
    "with_bag" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pro_lots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pro_lots_code_key" ON "pro_lots"("code");

-- CreateIndex
CREATE INDEX "pro_lots_user_id_idx" ON "pro_lots"("user_id");

-- AddForeignKey
ALTER TABLE "pro_lots" ADD CONSTRAINT "pro_lots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
