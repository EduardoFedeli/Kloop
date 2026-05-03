-- CreateTable
CREATE TABLE "brand_follows" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brand_follows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "brand_follows_user_id_idx" ON "brand_follows"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "brand_follows_user_id_brand_key" ON "brand_follows"("user_id", "brand");

-- AddForeignKey
ALTER TABLE "brand_follows" ADD CONSTRAINT "brand_follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
