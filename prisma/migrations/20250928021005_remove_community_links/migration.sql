/*
  Warnings:

  - You are about to drop the column `telegramCommunityLink` on the `store_settings` table. All the data in the column will be lost.
  - You are about to drop the column `whatsappCommunityLink` on the `store_settings` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_store_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "storeName" TEXT NOT NULL DEFAULT 'Mi Tienda',
    "storeSlug" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "whatsappMainNumber" TEXT,
    "whatsappSequentialNumbers" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Mexico',
    "language" TEXT NOT NULL DEFAULT 'es',
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "distanceUnit" TEXT NOT NULL DEFAULT 'km',
    "mapProvider" TEXT NOT NULL DEFAULT 'openstreetmap',
    "googleMapsApiKey" TEXT,
    "taxRate" REAL NOT NULL DEFAULT 0.0,
    "taxMethod" TEXT NOT NULL DEFAULT 'included',
    "tagId" TEXT,
    "enableBusinessHours" BOOLEAN NOT NULL DEFAULT false,
    "disableCheckoutOutsideHours" BOOLEAN NOT NULL DEFAULT false,
    "businessHours" JSONB,
    "instagramLink" TEXT,
    "facebookLink" TEXT,
    "deliveryEnabled" BOOLEAN NOT NULL DEFAULT false,
    "useBasePrice" BOOLEAN NOT NULL DEFAULT false,
    "baseDeliveryPrice" REAL,
    "baseDeliveryThreshold" REAL,
    "unifiedSchedule" JSONB,
    "deliveryScheduleEnabled" BOOLEAN NOT NULL DEFAULT false,
    "scheduleType" TEXT,
    "advanceDays" INTEGER NOT NULL DEFAULT 1,
    "serviceHours" JSONB,
    "paymentsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "cashPaymentEnabled" BOOLEAN NOT NULL DEFAULT true,
    "cashPaymentInstructions" TEXT,
    "bankTransferEnabled" BOOLEAN NOT NULL DEFAULT false,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "accountHolder" TEXT,
    "clabe" TEXT,
    "transferInstructions" TEXT,
    "paymentInstructions" TEXT,
    "storeActive" BOOLEAN NOT NULL DEFAULT false,
    "passwordProtected" BOOLEAN NOT NULL DEFAULT false,
    "accessPassword" TEXT,
    "bannerImage" TEXT,
    "profileImage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "store_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_store_settings" ("accessPassword", "accountHolder", "accountNumber", "address", "advanceDays", "bankName", "bankTransferEnabled", "bannerImage", "baseDeliveryPrice", "baseDeliveryThreshold", "businessHours", "cashPaymentEnabled", "cashPaymentInstructions", "clabe", "country", "createdAt", "currency", "deliveryEnabled", "deliveryScheduleEnabled", "disableCheckoutOutsideHours", "distanceUnit", "email", "enableBusinessHours", "facebookLink", "googleMapsApiKey", "id", "instagramLink", "language", "mapProvider", "passwordProtected", "paymentInstructions", "paymentsEnabled", "profileImage", "scheduleType", "serviceHours", "storeActive", "storeName", "storeSlug", "tagId", "taxMethod", "taxRate", "transferInstructions", "unifiedSchedule", "updatedAt", "useBasePrice", "userId", "whatsappMainNumber", "whatsappSequentialNumbers") SELECT "accessPassword", "accountHolder", "accountNumber", "address", "advanceDays", "bankName", "bankTransferEnabled", "bannerImage", "baseDeliveryPrice", "baseDeliveryThreshold", "businessHours", "cashPaymentEnabled", "cashPaymentInstructions", "clabe", "country", "createdAt", "currency", "deliveryEnabled", "deliveryScheduleEnabled", "disableCheckoutOutsideHours", "distanceUnit", "email", "enableBusinessHours", "facebookLink", "googleMapsApiKey", "id", "instagramLink", "language", "mapProvider", "passwordProtected", "paymentInstructions", "paymentsEnabled", "profileImage", "scheduleType", "serviceHours", "storeActive", "storeName", "storeSlug", "tagId", "taxMethod", "taxRate", "transferInstructions", "unifiedSchedule", "updatedAt", "useBasePrice", "userId", "whatsappMainNumber", "whatsappSequentialNumbers" FROM "store_settings";
DROP TABLE "store_settings";
ALTER TABLE "new_store_settings" RENAME TO "store_settings";
CREATE UNIQUE INDEX "store_settings_userId_key" ON "store_settings"("userId");
CREATE UNIQUE INDEX "store_settings_storeSlug_key" ON "store_settings"("storeSlug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
