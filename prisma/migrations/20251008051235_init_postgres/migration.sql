-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'CLIENT');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."InvitationStatus" AS ENUM ('PENDING', 'USED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."DeliveryType" AS ENUM ('FIXED', 'DISTANCE', 'ZONES', 'MANUAL');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'CLIENT',
    "company" TEXT,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "suspensionReason" TEXT,
    "suspendedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIP" TEXT,
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT,
    "isVisibleInStore" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hasVariants" BOOLEAN NOT NULL DEFAULT false,
    "variantType" TEXT,
    "variantLabel" TEXT,
    "allowPickup" BOOLEAN NOT NULL DEFAULT true,
    "allowShipping" BOOLEAN NOT NULL DEFAULT true,
    "trackQuantity" BOOLEAN NOT NULL DEFAULT false,
    "dailyCapacity" BOOLEAN NOT NULL DEFAULT false,
    "maxDailySales" INTEGER,
    "maxOrderQuantity" BOOLEAN NOT NULL DEFAULT false,
    "maxQuantity" INTEGER,
    "minOrderQuantity" BOOLEAN NOT NULL DEFAULT false,
    "minQuantity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."category_products" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" TEXT NOT NULL,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_variants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "originalPrice" DOUBLE PRECISION,
    "imageUrl" TEXT,
    "sku" TEXT,
    "stock" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "total" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION,
    "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerWhatsApp" TEXT NOT NULL,
    "deliveryMethod" TEXT NOT NULL,
    "address" JSONB,
    "paymentMethod" TEXT NOT NULL,
    "amountPaid" DOUBLE PRECISION,
    "change" DOUBLE PRECISION,
    "notes" TEXT,
    "trackingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_items" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "variantName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_item_options" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "optionName" TEXT NOT NULL,
    "choiceName" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_item_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invitations" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT,
    "slug" TEXT NOT NULL,
    "status" "public"."InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "serviceStart" TIMESTAMP(3),
    "serviceRenewal" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_options" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "enableQuantity" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "product_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_option_choices" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "optionId" TEXT NOT NULL,

    CONSTRAINT "product_option_choices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."store_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storeName" TEXT NOT NULL DEFAULT 'Mi Tienda',
    "storeSlug" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "whatsappMainNumber" TEXT,
    "phoneNumber" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Mexico',
    "language" TEXT NOT NULL DEFAULT 'es',
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "distanceUnit" TEXT NOT NULL DEFAULT 'km',
    "mapProvider" TEXT NOT NULL DEFAULT 'openstreetmap',
    "googleMapsApiKey" TEXT,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "taxMethod" TEXT NOT NULL DEFAULT 'included',
    "tagId" TEXT,
    "enableBusinessHours" BOOLEAN NOT NULL DEFAULT false,
    "disableCheckoutOutsideHours" BOOLEAN NOT NULL DEFAULT false,
    "businessHours" JSONB,
    "instagramLink" TEXT,
    "facebookLink" TEXT,
    "deliveryEnabled" BOOLEAN NOT NULL DEFAULT false,
    "useBasePrice" BOOLEAN NOT NULL DEFAULT false,
    "baseDeliveryPrice" DOUBLE PRECISION,
    "baseDeliveryThreshold" DOUBLE PRECISION,
    "deliveryCalculationMethod" TEXT,
    "pricePerKm" DOUBLE PRECISION,
    "minDeliveryFee" DOUBLE PRECISION,
    "maxDeliveryDistance" DOUBLE PRECISION,
    "manualDeliveryMessage" TEXT,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."delivery_zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."DeliveryType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "fixedPrice" DOUBLE PRECISION,
    "freeDeliveryThreshold" DOUBLE PRECISION,
    "estimatedTime" INTEGER,
    "description" TEXT,
    "useBasePrice" BOOLEAN NOT NULL DEFAULT false,
    "basePrice" DOUBLE PRECISION,
    "basePriceThreshold" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "storeSettingsId" TEXT NOT NULL,

    CONSTRAINT "delivery_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."global_options" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "maxSelections" INTEGER,
    "minSelections" INTEGER,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "global_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."global_option_choices" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "globalOptionId" TEXT NOT NULL,

    CONSTRAINT "global_option_choices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_global_options" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "globalOptionId" TEXT NOT NULL,
    "maxSelections" INTEGER,
    "minSelections" INTEGER,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_global_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."global_option_availability" (
    "id" TEXT NOT NULL,
    "globalOptionId" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_option_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."global_option_choice_availability" (
    "id" TEXT NOT NULL,
    "choiceId" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_option_choice_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "category_products_categoryId_productId_key" ON "public"."category_products"("categoryId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "public"."orders"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_code_key" ON "public"."invitations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_slug_key" ON "public"."invitations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "store_settings_userId_key" ON "public"."store_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "store_settings_storeSlug_key" ON "public"."store_settings"("storeSlug");

-- CreateIndex
CREATE UNIQUE INDEX "product_global_options_productId_globalOptionId_key" ON "public"."product_global_options"("productId", "globalOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "global_option_availability_globalOptionId_key" ON "public"."global_option_availability"("globalOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "global_option_choice_availability_choiceId_key" ON "public"."global_option_choice_availability"("choiceId");

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."category_products" ADD CONSTRAINT "category_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."category_products" ADD CONSTRAINT "category_products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_images" ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_item_options" ADD CONSTRAINT "order_item_options_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "public"."order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_options" ADD CONSTRAINT "product_options_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_option_choices" ADD CONSTRAINT "product_option_choices_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "public"."product_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."store_settings" ADD CONSTRAINT "store_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."delivery_zones" ADD CONSTRAINT "delivery_zones_storeSettingsId_fkey" FOREIGN KEY ("storeSettingsId") REFERENCES "public"."store_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."global_options" ADD CONSTRAINT "global_options_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."global_option_choices" ADD CONSTRAINT "global_option_choices_globalOptionId_fkey" FOREIGN KEY ("globalOptionId") REFERENCES "public"."global_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_global_options" ADD CONSTRAINT "product_global_options_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_global_options" ADD CONSTRAINT "product_global_options_globalOptionId_fkey" FOREIGN KEY ("globalOptionId") REFERENCES "public"."global_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."global_option_availability" ADD CONSTRAINT "global_option_availability_globalOptionId_fkey" FOREIGN KEY ("globalOptionId") REFERENCES "public"."global_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."global_option_choice_availability" ADD CONSTRAINT "global_option_choice_availability_choiceId_fkey" FOREIGN KEY ("choiceId") REFERENCES "public"."global_option_choices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
