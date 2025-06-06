# MoMo Payment Integration Setup

## Environment Variables

Add these variables to your `.env` file:

```bash
# MoMo Payment Configuration (Sandbox)
MOMO_PARTNER_CODE=MOMOBKUN20180529
MOMO_ACCESS_KEY=klm05TvNBzhg7h7j
MOMO_SECRET_KEY=at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create

# URLs for MoMo callbacks
MOMO_RETURN_URL=http://localhost:3000/payment/success
MOMO_NOTIFY_URL=http://localhost:5000/api/payments/momo/callback
CLIENT_URL=http://localhost:3000
```

## Test Credentials

**For Sandbox Testing:**
- Partner Code: `MOMOBKUN20180529`
- Access Key: `klm05TvNBzhg7h7j`
- Secret Key: `at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa`

**Test Phone Numbers:**
- `0963181714` (Success)
- `0963181715` (Failed)

## API Endpoints

### Create Payment
```
POST /api/payments/momo/create
Authorization: Bearer <token>
{
  "bookingId": "string"
}
```

### Payment Callback (MoMo Server)
```
POST /api/payments/momo/callback
```

### Payment Return URL
```
GET /api/payments/momo/return?orderId=...&resultCode=...
```

### Check Payment Status
```
GET /api/payments/momo/status/:orderId
Authorization: Bearer <token>
```

## Testing Flow

1. Create a booking
2. Call payment creation API
3. Open MoMo payment URL in browser
4. Use test phone number to complete payment
5. Check payment status via API
6. Verify booking status updated

## Production Setup

For production, you need to:
1. Register with MoMo Business
2. Get production credentials
3. Update environment variables
4. Set up proper domain URLs
5. Configure webhooks properly 