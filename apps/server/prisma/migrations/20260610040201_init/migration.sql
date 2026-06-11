-- CreateTable
CREATE TABLE "Trip" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "destination" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "preferences" JSONB NOT NULL DEFAULT [],
    "title" TEXT NOT NULL,
    "nights" TEXT NOT NULL,
    "placeCount" INTEGER NOT NULL,
    "cover" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "dayPlans" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
