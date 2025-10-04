-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "company" TEXT,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "suspensionReason" TEXT,
    "suspendedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT,
    "isVisibleInStore" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hasVariants" BOOLEAN NOT NULL DEFAULT false,
    "variantType" TEXT,
    "variantLabel" TEXT,
    "deliveryHome" BOOLEAN NOT NULL DEFAULT true,
    "deliveryStore" BOOLEAN NOT NULL DEFAULT true,
    "deliveryBoth" BOOLEAN NOT NULL DEFAULT true,
    "trackQuantity" BOOLEAN NOT NULL DEFAULT false,
    "dailyCapacity" BOOLEAN NOT NULL DEFAULT false,
    "maxDailySales" INTEGER,
    "maxOrderQuantity" BOOLEAN NOT NULL DEFAULT false,
    "maxQuantity" INTEGER,
    "minOrderQuantity" BOOLEAN NOT NULL DEFAULT false,
    "minQuantity" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "products_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "category_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "category_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "category_products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" TEXT NOT NULL,
    CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "originalPrice" REAL,
    "imageUrl" TEXT,
    "sku" TEXT,
    "stock" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "productId" TEXT NOT NULL,
    CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "total" REAL NOT NULL,
    "customerEmail" TEXT,
    "customerName" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "variantName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    CONSTRAINT "order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "serviceStart" DATETIME,
    "serviceRenewal" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "product_options" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "enableQuantity" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "productId" TEXT NOT NULL,
    CONSTRAINT "product_options_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_option_choices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "optionId" TEXT NOT NULL,
    CONSTRAINT "product_option_choices_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "product_options" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "store_settings" (
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
    "whatsappCommunityLink" TEXT,
    "telegramCommunityLink" TEXT,
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
    "storeActive" BOOLEAN NOT NULL DEFAULT false,
    "passwordProtected" BOOLEAN NOT NULL DEFAULT false,
    "accessPassword" TEXT,
    "bannerImage" TEXT,
    "profileImage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "store_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "delivery_zones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "fixedPrice" REAL,
    "freeDeliveryThreshold" REAL,
    "estimatedTime" INTEGER,
    "description" TEXT,
    "useBasePrice" BOOLEAN NOT NULL DEFAULT false,
    "basePrice" REAL,
    "basePriceThreshold" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "storeSettingsId" TEXT NOT NULL,
    CONSTRAINT "delivery_zones_storeSettingsId_fkey" FOREIGN KEY ("storeSettingsId") REFERENCES "store_settings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "category_products_categoryId_productId_key" ON "category_products"("categoryId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_code_key" ON "invitations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_slug_key" ON "invitations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "store_settings_userId_key" ON "store_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "store_settings_storeSlug_key" ON "store_settings"("storeSlug");
