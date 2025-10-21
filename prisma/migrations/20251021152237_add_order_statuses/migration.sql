-- AlterEnum: Add missing order statuses
ALTER TYPE "OrderStatus" ADD VALUE 'PREPARING';
ALTER TYPE "OrderStatus" ADD VALUE 'READY';
ALTER TYPE "OrderStatus" ADD VALUE 'IN_DELIVERY';
ALTER TYPE "OrderStatus" ADD VALUE 'COMPLETED';

-- Note: SHIPPED is not removed to preserve existing data compatibility
-- If you want to remove SHIPPED, you would need to first migrate any existing SHIPPED orders to another status
