-- AlterEnum: Add missing order statuses
-- PostgreSQL allows adding enum values but not removing them in a simple way
-- We add the new values and keep SHIPPED for backward compatibility

-- Add new enum values if they don't exist
DO $$ BEGIN
    ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'PREPARING';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'READY';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'IN_DELIVERY';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'COMPLETED';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Note: SHIPPED is kept for backward compatibility
-- To remove it, you would need to:
-- 1. Migrate all SHIPPED orders to another status
-- 2. Create a new enum without SHIPPED
-- 3. Alter the column to use the new enum
-- 4. Drop the old enum
