-- Add PAYMENT_FAILED value to Plan enum
-- Used when invoice.payment_failed fires: workspace stays subscribed but
-- loses Pro features until payment is recovered or subscription is deleted.
ALTER TYPE "Plan" ADD VALUE IF NOT EXISTS 'PAYMENT_FAILED';
