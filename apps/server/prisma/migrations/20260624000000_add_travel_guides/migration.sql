-- CreateTable
CREATE TABLE "TravelGuide" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT '途绘精选',
    "cover" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "likes" TEXT NOT NULL DEFAULT '1w+',
    "snippet" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "keywords" TEXT[],

    CONSTRAINT "TravelGuide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TravelGuide_destination_idx" ON "TravelGuide"("destination");

-- CreateIndex
CREATE INDEX "TravelGuide_category_idx" ON "TravelGuide"("category");
