-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trip" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
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
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Trip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Trip" ("cover", "createdAt", "dayPlans", "days", "destination", "id", "nights", "placeCount", "preferences", "theme", "title", "updatedAt") SELECT "cover", "createdAt", "dayPlans", "days", "destination", "id", "nights", "placeCount", "preferences", "theme", "title", "updatedAt" FROM "Trip";
DROP TABLE "Trip";
ALTER TABLE "new_Trip" RENAME TO "Trip";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
