# Payment System Development Mode

## Status
- Status: Completed
- Date: 2026-01-12
- Version: 1.0

## Overview

This document describes the development mode implementation for the SafariPlus payment system. The dev mode allows developers to test payment flows using 1 KES instead of actual amounts, making it easier and cheaper to test Pesapal integration without incurring actual charges.

## What Was Implemented

### 1. Environment Variable Configuration

Added `PESAPAL_DEV_MODE` environment variable to control development mode:

```bash
# .env
PESAPAL_DEV_MODE=true  # Set to "true" to enable dev mode, any other value disables it
```

### 2. Payment Initiation Route Updates

**File**: `/src/app/api/payments/initiate/route.ts`

**Changes**:
- Added dev mode detection using `process.env.PESAPAL_DEV_MODE === "true"`
- When dev mode is enabled:
  - Override Pesapal submission amount to 1 KES
  - Override currency to "KES"
  - Keep original booking amount in database for record keeping
- Added comprehensive logging to track when dev mode is used

**Key Code**:
```typescript
// Check for development mode
const isDevMode = process.env.PESAPAL_DEV_MODE === "true"

// In dev mode, use 1 KES for testing; otherwise use actual amount
const pesapalAmount = isDevMode ? 1 : booking.totalAmount
const pesapalCurrency = isDevMode ? "KES" : booking.currency

// Log dev mode status for debugging
if (isDevMode) {
  log.info(`Dev mode enabled: Using ${pesapalCurrency} ${pesapalAmount} for testing (actual: ${booking.currency} ${booking.totalAmount})`, {
    bookingReference: booking.bookingReference,
  })
}
```

**Benefits**:
- UI displays USD amounts throughout the application
- Only when submitting to Pesapal, the amount is converted to 1 KES
- Database stores the actual booking amount for accurate records
- Easy to switch between dev and production modes

### 3. Withdrawal Route Updates

**File**: `/src/app/api/agent/withdrawals/route.ts`

**Changes**:
- Added dev mode detection for withdrawal requests
- When dev mode is enabled:
  - Minimum withdrawal amount is set to 1 (instead of $50)
  - Allows agents to test withdrawal flows with minimal amounts
- Added logging for dev mode withdrawals

**Key Code**:
```typescript
// Check for development mode
const isDevMode = process.env.PESAPAL_DEV_MODE === "true"

// In dev mode, allow 1 KES test withdrawals; otherwise enforce minimum
const minWithdrawal = isDevMode ? 1 : (settings?.minWithdrawalAmount || 50.0)

// Log dev mode status for debugging
if (isDevMode && data.amount === 1) {
  console.log(`Dev mode enabled: Processing 1 KES test withdrawal for agent ${agent.id}`)
}
```

**Benefits**:
- Agents can test withdrawal functionality without needing to accumulate $50
- All withdrawal validation and processing logic is tested
- Easy to verify withdrawal approval workflows

### 4. Payment Page UI Enhancement

**File**: `/src/app/booking/payment/[id]/page.tsx`

**Changes**:
- Replaced browser `alert()` with Sonner toast notifications
- Provides better user experience with styled error messages
- Consistent with the rest of the application's notification system

**Before**:
```typescript
alert("Payment failed. Please try again.")
```

**After**:
```typescript
toast.error("Payment Failed", {
  description: error instanceof Error ? error.message : "Payment failed. Please try again.",
})
```

**Benefits**:
- Professional error handling with styled toasts
- Non-blocking notifications that don't interrupt user flow
- Consistent with application design system
- Better accessibility

### 5. TypeScript Bug Fix

**File**: `/src/hooks/use-messages.ts`

**Issue**: TypeScript error due to incorrect type inference for Pusher channel reference

**Fix**: Updated type definition to properly handle nullable Pusher client return type
```typescript
const channelRef = useRef<ReturnType<Exclude<ReturnType<typeof getPusherClient>, null>["subscribe"]> | null>(null)
```

## How to Use Development Mode

### For Payment Testing

1. Set environment variable:
   ```bash
   PESAPAL_DEV_MODE=true
   ```

2. Restart the development server:
   ```bash
   npm run dev
   ```

3. Create a booking with any amount (e.g., $500, $1000)

4. Proceed to payment - the UI will show the actual amount

5. When payment is initiated:
   - Pesapal receives 1 KES
   - Database stores the actual amount
   - All payment flows work normally
   - Webhook processing works as expected

6. Check server logs for confirmation:
   ```
   Dev mode enabled: Using KES 1 for testing (actual: USD 500)
   ```

### For Withdrawal Testing

1. Enable dev mode as above

2. As an agent, request a withdrawal for 1 KES

3. The system will accept the request (normally requires $50 minimum)

4. Test approval/rejection workflows normally

5. Check logs for dev mode confirmation

### Disabling Development Mode

To disable dev mode and use real amounts:

1. Set in `.env`:
   ```bash
   PESAPAL_DEV_MODE=false
   # or remove the variable entirely
   ```

2. Restart the server

3. All payments will now use actual amounts

## Security Considerations

### Safe Implementation
- Dev mode only affects payment amounts sent to Pesapal
- Database always stores actual booking amounts
- No data corruption or inconsistencies
- Easy to audit with logging

### Important Warnings

1. **Never enable dev mode in production**
   - Only use in development/staging environments
   - Production should always use real amounts

2. **Environment variable security**
   - Never commit `.env` files to version control
   - Use `.env.example` for templates
   - Set production variables securely via hosting platform

3. **Testing considerations**
   - Dev mode uses Pesapal sandbox environment
   - Test with sandbox credentials only
   - Verify actual production payments before going live

## Testing Checklist

- [x] Payment initiation with dev mode enabled
- [x] Payment initiation with dev mode disabled
- [x] Withdrawal request with dev mode enabled
- [x] Withdrawal request with dev mode disabled
- [x] Toast notifications display correctly
- [x] Build completes without TypeScript errors
- [x] Logging shows correct dev mode status
- [x] Database stores actual amounts correctly
- [x] Pesapal receives 1 KES in dev mode

## Database Records

### Example Payment Record (Dev Mode)

```json
{
  "id": "payment_id",
  "bookingId": "booking_id",
  "amount": 500.00,           // Actual booking amount stored
  "currency": "USD",           // Original currency
  "pesapalOrderId": "...",
  "status": "COMPLETED",
  "method": "MPESA"
}
```

**Note**: Even though Pesapal processed 1 KES, the database correctly stores $500 USD.

### Example Withdrawal Record (Dev Mode)

```json
{
  "id": "withdrawal_id",
  "agentId": "agent_id",
  "amount": 1.00,              // Test amount
  "currency": "KES",
  "status": "PENDING",
  "method": "mpesa"
}
```

## Troubleshooting

### Dev Mode Not Working

**Symptom**: Payments still using actual amounts

**Solutions**:
1. Check `.env` file has `PESAPAL_DEV_MODE=true` (exact string)
2. Restart development server after changing .env
3. Check server logs for dev mode detection
4. Verify no typos in environment variable name

### Toast Not Showing

**Symptom**: Error toast doesn't appear

**Solutions**:
1. Verify Sonner Toaster is in providers (`src/components/providers.tsx`)
2. Check browser console for errors
3. Ensure `sonner` package is installed: `npm list sonner`

### TypeScript Errors

**Symptom**: Build fails with type errors

**Solutions**:
1. Run `npm install` to ensure all dependencies are installed
2. Clear Next.js cache: `rm -rf .next`
3. Restart TypeScript server in your IDE

## Monitoring and Logging

### What Gets Logged

1. **Payment Initiation** (dev mode enabled):
   ```
   Dev mode enabled: Using KES 1 for testing (actual: USD 500)
   ```

2. **Withdrawal Request** (dev mode enabled):
   ```
   Dev mode enabled: Processing 1 KES test withdrawal for agent agent_123
   ```

3. **Payment Completion** (standard logging):
   ```
   Payment initiated
   {
     paymentId: "...",
     bookingReference: "SP-...",
     amount: "USD 500"  // Actual amount logged
   }
   ```

### Log Locations

- Development: Console output (`npm run dev`)
- Production: Application logs (via hosting platform)
- Custom logger: `/src/lib/logger.ts`

## Future Enhancements

### Potential Improvements

1. **Configurable Test Amount**
   ```bash
   PESAPAL_DEV_MODE=true
   PESAPAL_TEST_AMOUNT=5  # Use 5 KES instead of 1
   ```

2. **Dev Mode Indicator in UI**
   - Show badge when dev mode is active
   - Prevent accidental production use

3. **Automated Testing**
   - Integration tests using dev mode
   - Verify payment flows automatically

4. **Dev Mode Metrics**
   - Track how many dev mode payments processed
   - Monitor for accidental production usage

## Related Documentation

- [Payment System Overview](./feature-payments.md)
- [Pesapal Integration Guide](./PESAPAL-QUICK-START.md)
- [Pesapal Security Audit](./pesapal-security-audit.md)
- [Withdrawal System](./feature-withdrawals.md)

## Changelog

### Version 1.0 (2026-01-12)
- Initial implementation of dev mode
- Payment initiation route updated
- Withdrawal route updated
- Toast notification implementation
- TypeScript fixes
- Documentation created

## Support

For questions or issues:
1. Check logs for dev mode confirmation
2. Review this documentation
3. Verify environment variables are set correctly
4. Test with Pesapal sandbox credentials
