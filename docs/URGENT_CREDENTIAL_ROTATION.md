# 🚨 URGENT: Credential Rotation Required

**CRITICAL SECURITY ISSUE DETECTED**

Production credentials were found in the committed `.env` file. These MUST be rotated immediately before deployment.

**Risk Level:** CRITICAL ⚠️
**Status:** ACTION REQUIRED IMMEDIATELY
**Estimated Time:** 2-3 hours

---

## ⚠️ What Happened

The `.env` file containing production credentials was committed to the git repository. This file contains:
- Database connection strings with passwords
- Google OAuth client secrets
- Cloudinary API secrets
- Pesapal payment gateway credentials
- Authentication secrets

**Impact:** Anyone with access to the repository can access your:
- Database (full read/write access)
- Payment gateway (ability to process payments)
- User accounts (via OAuth hijacking)
- Session tokens (via AUTH_SECRET)

---

## 📋 Step-by-Step Credential Rotation

Follow these steps IN ORDER:

---

### STEP 1: Generate New AUTH_SECRET (5 minutes)

#### 1.1 Generate New Secret
```bash
openssl rand -base64 32
```

Copy the output (e.g., `X7k9L2mP4nQ6rS8tU1vW3xY5zA7bC9dE1fG3hI5jK7lM9n==`)

#### 1.2 Update in Vercel
```bash
# Remove old secret
vercel env rm AUTH_SECRET production

# Add new secret
vercel env add AUTH_SECRET production
# Paste the new secret when prompted

# Verify
vercel env ls
```

#### 1.3 Update Locally (for development)
```bash
# Edit .env.local (NOT .env)
# Update AUTH_SECRET with new value
```

**Impact:** All existing user sessions will be invalidated. Users will need to log in again.

**Status:** [ ] COMPLETED

---

### STEP 2: Rotate Database Credentials (10 minutes)

#### 2.1 Change Password in Neon Dashboard
1. Go to https://console.neon.tech
2. Select your project: `safariplus`
3. Go to Settings > Database
4. Click "Reset Password"
5. Copy the new password
6. Generate new connection strings

#### 2.2 Update Connection Strings in Vercel
```bash
# Format (use your new password):
# postgresql://neondb_owner:NEW_PASSWORD@ep-weathered-violet-ahd0gs7d-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# Update pooled connection
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production
# Paste new connection string

# Update unpooled connection (for migrations)
vercel env rm DATABASE_URL_UNPOOLED production
vercel env add DATABASE_URL_UNPOOLED production
# Paste unpooled connection string
```

#### 2.3 Update Locally
```bash
# Edit .env.local
# Update DATABASE_URL with new connection string
```

#### 2.4 Test Connection
```bash
npm run db:studio
# Should connect successfully with new credentials
```

**Status:** [ ] COMPLETED

---

### STEP 3: Rotate Google OAuth Credentials (15 minutes)

#### 3.1 Create New OAuth Application
1. Go to https://console.cloud.google.com/apis/credentials
2. Create new OAuth 2.0 Client ID
3. Application type: Web application
4. Name: `SafariPlus Production`

#### 3.2 Configure Authorized Redirect URIs
Add these URIs:
```
https://yourdomain.com/api/auth/callback/google
https://www.yourdomain.com/api/auth/callback/google
```

For staging/preview:
```
https://your-project.vercel.app/api/auth/callback/google
```

#### 3.3 Copy New Credentials
- Client ID: `xxxxx.apps.googleusercontent.com`
- Client Secret: `GOCSPX-xxxxx`

#### 3.4 Update in Vercel
```bash
vercel env rm GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_ID production
# Paste new client ID

vercel env rm GOOGLE_CLIENT_SECRET production
vercel env add GOOGLE_CLIENT_SECRET production
# Paste new client secret
```

#### 3.5 Update Locally
```bash
# Edit .env.local
# Update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
```

#### 3.6 REVOKE Old Credentials
1. Go back to Google Cloud Console
2. Find the old OAuth client: `535978188867-dk1b52cb9iji5udnjobm5o8ssngahs42`
3. Delete or disable it
4. Confirm deletion

**Status:** [ ] COMPLETED

---

### STEP 4: Rotate Cloudinary Credentials (10 minutes)

#### 4.1 Generate New API Key
1. Go to https://cloudinary.com/console
2. Navigate to Settings > Security
3. Click "Generate New Key"
4. Copy:
   - API Key: `946426349816257` (new)
   - API Secret: `xxxxx` (new)

#### 4.2 Update in Vercel
```bash
vercel env rm CLOUDINARY_API_KEY production
vercel env add CLOUDINARY_API_KEY production
# Paste new API key

vercel env rm CLOUDINARY_API_SECRET production
vercel env add CLOUDINARY_API_SECRET production
# Paste new API secret

# Cloud name stays the same
vercel env add CLOUDINARY_CLOUD_NAME production
# Enter: dzeczmghb
```

#### 4.3 Update Locally
```bash
# Edit .env.local
# Update CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET
```

#### 4.4 REVOKE Old Credentials
1. Go back to Cloudinary Console
2. Find the old API key: `946426349816257`
3. Revoke/Delete it
4. Confirm deletion

#### 4.5 Test Upload
```bash
# Test that image uploads still work
# Try uploading an image through the app
```

**Status:** [ ] COMPLETED

---

### STEP 5: Rotate Pesapal Credentials (20 minutes)

**Note:** Pesapal credential rotation depends on their policy. Contact support if you can't generate new credentials.

#### Option A: Generate New Credentials (if available)
1. Go to https://dashboard.pesapal.com
2. Navigate to API Settings
3. Generate new consumer key and secret
4. Follow steps below

#### Option B: Create New Merchant Account (recommended)
1. Create new merchant account
2. Complete verification
3. Get new consumer key and secret

#### 5.1 Register New IPN URL
```bash
# After getting new credentials, register IPN:
# You'll need to do this programmatically or via Pesapal dashboard

# IPN URL: https://yourdomain.com/api/webhooks/pesapal
# Method: POST
```

#### 5.2 Update in Vercel
```bash
vercel env rm PESAPAL_CONSUMER_KEY production
vercel env add PESAPAL_CONSUMER_KEY production
# Paste new consumer key

vercel env rm PESAPAL_CONSUMER_SECRET production
vercel env add PESAPAL_CONSUMER_SECRET production
# Paste new consumer secret

vercel env rm PESAPAL_IPN_ID production
vercel env add PESAPAL_IPN_ID production
# Paste new IPN ID after registration
```

#### 5.3 Update API URL (if switching environments)
```bash
# Production
vercel env add PESAPAL_API_URL production
# Enter: https://pay.pesapal.com/v3

vercel env add PESAPAL_ENVIRONMENT production
# Enter: production

# Ensure dev mode is OFF
vercel env add PESAPAL_DEV_MODE production
# Enter: false
```

#### 5.4 Update Locally
```bash
# Edit .env.local
# Update all Pesapal credentials
```

#### 5.5 REVOKE Old Credentials
1. Contact Pesapal support
2. Request revocation of old credentials:
   - Consumer Key: `hrsFpg3E1hgIfRBVTweePxbZUKrTC125`
   - Consumer Secret: `wey6E8fHTdn7Xr96KAIn2/L+pxM=`

#### 5.6 Test Payment Flow
1. Create test booking
2. Initiate payment
3. Verify webhook receives notification
4. Confirm booking status updates

**Status:** [ ] COMPLETED

---

### STEP 6: Additional Environment Variables (10 minutes)

#### 6.1 Update Other Production Variables
```bash
# NEXTAUTH_URL (production domain)
vercel env add NEXTAUTH_URL production
# Enter: https://yourdomain.com

# NEXT_PUBLIC_APP_URL
vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://yourdomain.com

# Pesapal IPN URL
vercel env add PESAPAL_IPN_URL production
# Enter: https://yourdomain.com/api/webhooks/pesapal

# Email configuration (if not set)
vercel env add RESEND_API_KEY production
# Enter your Resend API key

vercel env add EMAIL_FROM production
# Enter: SafariPlus <noreply@yourdomain.com>

# Pusher configuration (if using)
vercel env add PUSHER_APP_ID production
vercel env add PUSHER_SECRET production
vercel env add NEXT_PUBLIC_PUSHER_KEY production
vercel env add NEXT_PUBLIC_PUSHER_CLUSTER production
```

**Status:** [ ] COMPLETED

---

### STEP 7: Clean Up Exposed Credentials (15 minutes)

#### 7.1 Update .gitignore (if not already)
```bash
# Verify .gitignore contains:
cat .gitignore | grep -E "\.env"

# Should include:
# .env*
# .env
# .env.local
# .env.development
# .env.production
```

#### 7.2 Remove .env from Git History (CRITICAL)
```bash
# WARNING: This rewrites git history
# Coordinate with team before running

# Check if .env is in history
git log --all --full-history -- .env

# If found, remove it (THIS CHANGES GIT HISTORY):
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (coordinate with team first!)
git push origin --force --all
git push origin --force --tags
```

#### 7.3 Clean Up Local Files
```bash
# Remove .env file (keep .env.local for development)
rm .env

# Verify .env is not tracked
git status

# If tracked, remove from git:
git rm --cached .env
git commit -m "Remove .env file from tracking"
```

#### 7.4 Update .env.local Template
```bash
# Copy from secure template
cp .env.example.secure .env.local

# Fill in your NEW credentials (rotated ones)
nano .env.local
```

**Status:** [ ] COMPLETED

---

### STEP 8: Deploy and Test (30 minutes)

#### 8.1 Deploy to Staging First
```bash
# Deploy to preview
vercel --env=preview

# Get preview URL
vercel ls

# Note the deployment URL
```

#### 8.2 Test All Features on Staging
- [ ] User registration works
- [ ] User login works
- [ ] Google OAuth works
- [ ] Database connects
- [ ] Image uploads work (Cloudinary)
- [ ] Tour browsing works
- [ ] Booking creation works
- [ ] Payment initiation works
- [ ] Webhook receives notifications
- [ ] Email confirmation sent

#### 8.3 Test Security Features
```bash
# Test rate limiting
for i in {1..15}; do curl -X POST https://preview-url.vercel.app/api/auth/signin; done

# Test security headers
curl -I https://preview-url.vercel.app | grep -E "X-|Content-Security|Strict-Transport"

# Test authentication
curl https://preview-url.vercel.app/api/admin/users
```

#### 8.4 Deploy to Production
```bash
# If all tests pass:
vercel --prod

# Monitor deployment
vercel logs
```

#### 8.5 Verify Production
- [ ] Visit production URL
- [ ] Check HTTPS is working
- [ ] Test user login
- [ ] Test a complete booking flow
- [ ] Monitor error logs for issues

**Status:** [ ] COMPLETED

---

## ✅ Verification Checklist

After completing all steps, verify:

### Credentials
- [ ] New AUTH_SECRET generated and deployed
- [ ] Database password changed
- [ ] New database connection strings deployed
- [ ] New Google OAuth credentials created
- [ ] Old Google OAuth credentials revoked
- [ ] New Cloudinary API key generated
- [ ] Old Cloudinary API key revoked
- [ ] New Pesapal credentials obtained
- [ ] Old Pesapal credentials revoked (contact support)
- [ ] All environment variables set in Vercel

### Git Repository
- [ ] .env file removed from git
- [ ] .env removed from git history
- [ ] .gitignore properly configured
- [ ] No credentials in code
- [ ] .env.local used for local development

### Testing
- [ ] All features tested on staging
- [ ] Security features tested
- [ ] Production deployment successful
- [ ] No errors in production logs
- [ ] Complete booking flow works

### Documentation
- [ ] Team notified of credential rotation
- [ ] Deployment documented
- [ ] Incident report filed (if needed)
- [ ] Security checklist completed

---

## 🆘 Emergency Contacts

If you encounter issues during rotation:

- **Neon Database Support:** https://neon.tech/support
- **Google Cloud Support:** https://cloud.google.com/support
- **Cloudinary Support:** https://support.cloudinary.com
- **Pesapal Support:** support@pesapal.com
- **Vercel Support:** support@vercel.com

---

## 📊 Estimated Timeline

| Step | Task | Time | Status |
|------|------|------|--------|
| 1 | Rotate AUTH_SECRET | 5 min | [ ] |
| 2 | Rotate Database credentials | 10 min | [ ] |
| 3 | Rotate Google OAuth | 15 min | [ ] |
| 4 | Rotate Cloudinary | 10 min | [ ] |
| 5 | Rotate Pesapal | 20 min | [ ] |
| 6 | Update other variables | 10 min | [ ] |
| 7 | Clean up git history | 15 min | [ ] |
| 8 | Deploy and test | 30 min | [ ] |
| **Total** | | **115 min** | |

**Total Time:** ~2 hours (plus time waiting for Pesapal support)

---

## 🎯 Success Criteria

You've successfully rotated all credentials when:
1. ✅ All new credentials are generated
2. ✅ All old credentials are revoked
3. ✅ Vercel environment variables updated
4. ✅ .env file removed from git
5. ✅ Staging tests pass
6. ✅ Production deployment successful
7. ✅ No errors in production logs
8. ✅ All features working normally

---

## 📝 Post-Rotation Actions

After successful rotation:

1. **Document Completion:**
   ```bash
   echo "Credential rotation completed on $(date)" >> SECURITY_LOG.md
   ```

2. **Notify Team:**
   - All credentials have been rotated
   - Old credentials are revoked
   - New credentials are in Vercel
   - Users may need to log in again

3. **Monitor:**
   - Watch error logs for 24 hours
   - Check for authentication issues
   - Monitor payment processing
   - Watch webhook success rate

4. **Update Documentation:**
   - Mark this document as completed
   - File security incident report (if needed)
   - Update team knowledge base

---

## ⚠️ Important Notes

1. **Coordinate with Team:**
   - Schedule credential rotation during low-traffic period
   - Notify team before starting
   - Have backup person available

2. **Backup Plan:**
   - Keep old credentials accessible until rotation is verified
   - Document rollback procedure
   - Test rollback if needed

3. **User Impact:**
   - Users will be logged out (new AUTH_SECRET)
   - OAuth users need to re-authenticate
   - No data will be lost
   - Bookings will continue to work

4. **Never Commit:**
   - Don't commit new credentials to git
   - Use Vercel environment variables
   - Keep .env.local locally only
   - Never push .env files

---

## 🚀 Start Credential Rotation

**Ready to begin?**

1. Set aside 2-3 hours
2. Have all accounts accessible (Neon, Google, Cloudinary, Pesapal, Vercel)
3. Notify your team
4. Follow steps in order
5. Test thoroughly before production deploy

**Start Time:** _______________

**Completion Time:** _______________

**Completed By:** _______________

---

**Status: PENDING IMMEDIATE ACTION ⚠️**

*This is a critical security task. Do not deploy to production until all credentials are rotated.*

---

*Document Created: January 13, 2026*
*Priority: CRITICAL*
*Due: ASAP (Before Production Deployment)*
