# Pesapal Integration - Quick Start Guide

**For Developers**: Get Pesapal payments working in 10 minutes

---

## 1. Get Pesapal Credentials (5 minutes)

### Sandbox (For Development)
1. Go to [Pesapal Dashboard](https://dashboard.pesapal.com/)
2. Sign up for a sandbox account
3. Navigate to **Settings** > **API Keys**
4. Copy your:
   - Consumer Key
   - Consumer Secret

### Register IPN URL
1. Run your local server with ngrok:
   ```bash
   ngrok http 3000
   ```
2. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
3. In Pesapal Dashboard, go to **IPN Settings**
4. Register: `https://abc123.ngrok.io/api/webhooks/pesapal`
5. Copy the IPN ID

---

## 2. Configure Environment Variables (2 minutes)

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Add your credentials:
```env
# Pesapal Sandbox
PESAPAL_CONSUMER_KEY=your_consumer_key_here
PESAPAL_CONSUMER_SECRET=your_consumer_secret_here
PESAPAL_IPN_URL=https://your-ngrok-url.ngrok.io/api/webhooks/pesapal
PESAPAL_IPN_ID=your_ipn_id_here
PESAPAL_ENVIRONMENT=sandbox
PESAPAL_API_URL=https://cybqa.pesapal.com/pesapalv3

# Your app URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 3. Start Development Server (1 minute)

```bash
npm run dev
```

Server should start on `http://localhost:3000`

---

## 4. Test Payment Flow (2 minutes)

### Create a Test Booking
1. Browse to a tour
2. Fill in booking details
3. Submit booking
4. Click "Pay Now"

### Test Payment Methods

#### M-Pesa (Sandbox)
- Phone: `0700000000` to `0700000003` (all auto-approve)
- Amount: Any

#### Credit Card (Sandbox)
- Visa: `4111111111111111`
- Expiry: Any future date
- CVV: `123`

#### Mastercard (Sandbox)
- Card: `5500000000000004`
- Expiry: Any future date
- CVV: `123`

---

## 5. Verify Payment (1 minute)

After completing payment:
1. Check webhook logs in terminal
2. Verify booking status updated to "CONFIRMED"
3. Check for confirmation email
4. View payment record in database

---

## API Endpoints

### Initiate Payment
```bash
POST /api/payments/initiate
Content-Type: application/json
Authorization: Bearer <session-token>

{
  "bookingId": "clx123abc456",
  "paymentMethod": "MPESA", # Optional
  "phoneNumber": "254712345678" # Optional
}
```

### Check Payment Status
```bash
GET /api/payments/status?bookingId=clx123abc456&refreshFromPesapal=true
Authorization: Bearer <session-token>
```

### Webhook (Called by Pesapal)
```bash
POST /api/webhooks/pesapal

{
  "OrderTrackingId": "abc123",
  "OrderMerchantReference": "SP-BOOK123-1234567890",
  "OrderNotificationType": "IPNCHANGE"
}
```

---

## Common Issues

### "Invalid IPN URL"
- Ensure URL is HTTPS (use ngrok for local dev)
- Verify URL is publicly accessible
- Check IPN ID matches dashboard

### "Authentication failed"
- Verify consumer key and secret are correct
- Check for extra spaces in .env file
- Ensure using correct environment (sandbox vs production)

### "Webhook not received"
- Check ngrok is running
- Verify IPN URL in .env matches ngrok URL
- Check webhook logs in Pesapal dashboard

### "Payment completed but booking still pending"
- Check webhook processing logs
- Verify database transaction completed
- Check audit logs for errors

---

## Production Deployment

### 1. Get Production Credentials
- Complete KYC verification on Pesapal
- Get production API keys
- Register production IPN URL (must be HTTPS)

### 2. Update Environment Variables
```env
PESAPAL_ENVIRONMENT=production
PESAPAL_API_URL=https://pay.pesapal.com/v3
PESAPAL_CONSUMER_KEY=prod_key_here
PESAPAL_CONSUMER_SECRET=prod_secret_here
PESAPAL_IPN_URL=https://yourdomain.com/api/webhooks/pesapal
PESAPAL_IPN_ID=prod_ipn_id_here
```

### 3. Security Checklist
- [ ] Enable HTTPS everywhere
- [ ] Add rate limiting
- [ ] Implement IP whitelist for webhooks
- [ ] Set up monitoring and alerts
- [ ] Test with real payments (small amounts)

---

## Monitoring

### Logs to Watch
```bash
# Payment initiation
Payment initiated: <payment-id>, Booking: <booking-ref>, Amount: <currency> <amount>

# Webhook received
[Pesapal IPN] Received notification: { OrderTrackingId, ... }

# Payment completed
[Pesapal IPN] Processing successful payment for booking: <booking-ref>

# Confirmation email
[Pesapal IPN] Confirmation email sent for booking: <booking-ref>
```

### Database Tables
- `Payment` - Payment records
- `Booking` - Updated status
- `AgentEarning` - Agent earnings
- `AuditLog` - All payment events

---

## Testing Checklist

- [ ] M-Pesa payment succeeds
- [ ] Card payment succeeds
- [ ] Failed payment handled correctly
- [ ] Duplicate webhook ignored
- [ ] Confirmation email received
- [ ] Agent earnings recorded
- [ ] Booking status updated
- [ ] Status API returns correct data

---

## Support

### Documentation
- Full docs: `/docs/pesapal-integration.md`
- Implementation summary: `/docs/backend/pesapal-implementation-summary.md`
- Security audit: `/docs/backend/pesapal-security-audit.md`

### Pesapal Support
- Email: support@pesapal.com
- Dashboard: https://dashboard.pesapal.com/
- Developer Docs: https://developer.pesapal.com/

---

## Quick Reference

### Payment Status Codes
- `0` = Invalid/Pending
- `1` = Completed
- `2` = Failed
- `3` = Reversed/Refunded

### Internal Payment Status
- `PENDING` = Payment not yet initiated
- `PROCESSING` = Waiting for payment completion
- `COMPLETED` = Payment successful
- `FAILED` = Payment failed
- `REFUNDED` = Payment refunded

### Supported Currencies
- `KES` = Kenya Shilling
- `TZS` = Tanzania Shilling
- `UGX` = Uganda Shilling
- `USD` = US Dollar

---

## Next Steps

1. ✅ Test in sandbox thoroughly
2. ✅ Review security audit
3. ✅ Set up monitoring
4. ✅ Get production credentials
5. ✅ Deploy to staging
6. ✅ Test with real money (small amounts)
7. ✅ Deploy to production
8. ✅ Monitor for 24 hours

**Estimated Time to Production**: 2-4 hours

---

Happy coding! 🚀
