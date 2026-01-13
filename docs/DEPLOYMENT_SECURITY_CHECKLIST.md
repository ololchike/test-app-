# SafariPlus Deployment Security Checklist

**CRITICAL: Complete ALL items before deploying to production**

---

## 🚨 CRITICAL - Must Do Before ANY Deployment

### 1. Rotate ALL Exposed Credentials ⚠️ URGENT

The following credentials were found in the committed `.env` file and MUST be rotated:

#### Database Credentials
- [ ] Change Neon database password
- [ ] Update `DATABASE_URL` in Vercel
- [ ] Update `DATABASE_URL_UNPOOLED` in Vercel
- [ ] Test database connection with new credentials

```bash
# Verify connection
npm run db:studio
```

#### Authentication Secret
- [ ] Generate new `AUTH_SECRET`
```bash
openssl rand -base64 32
```
- [ ] Update in Vercel environment variables
- [ ] This will invalidate all existing sessions (expected)

#### Google OAuth
- [ ] Create NEW Google OAuth application
- [ ] Get new `GOOGLE_CLIENT_ID`
- [ ] Get new `GOOGLE_CLIENT_SECRET`
- [ ] Update callback URLs in Google Console
- [ ] Update in Vercel environment variables
- [ ] REVOKE old OAuth credentials in Google Console

#### Cloudinary
- [ ] Generate new API key in Cloudinary
- [ ] Get new `CLOUDINARY_API_SECRET`
- [ ] Update in Vercel environment variables
- [ ] Revoke old API key in Cloudinary

#### Pesapal
- [ ] Contact Pesapal to rotate credentials (if possible)
- [ ] Or create new merchant account
- [ ] Update `PESAPAL_CONSUMER_KEY`
- [ ] Update `PESAPAL_CONSUMER_SECRET`
- [ ] Re-register IPN URL
- [ ] Update `PESAPAL_IPN_ID`

---

## 📋 Pre-Deployment Checklist

### Environment Variables

#### Required for ALL Environments
- [ ] `AUTH_SECRET` - Unique per environment
- [ ] `DATABASE_URL` - With SSL mode
- [ ] `DATABASE_URL_UNPOOLED` - For migrations
- [ ] `NEXTAUTH_URL` - Correct domain for environment
- [ ] `NEXT_PUBLIC_APP_URL` - Correct domain

#### Production Only
- [ ] `GOOGLE_CLIENT_ID` - Production OAuth app
- [ ] `GOOGLE_CLIENT_SECRET` - Production OAuth app
- [ ] `PESAPAL_CONSUMER_KEY` - Production keys
- [ ] `PESAPAL_CONSUMER_SECRET` - Production keys
- [ ] `PESAPAL_API_URL` - https://pay.pesapal.com/v3
- [ ] `PESAPAL_IPN_URL` - Production webhook URL
- [ ] `PESAPAL_IPN_ID` - Registered production IPN
- [ ] `PESAPAL_ENVIRONMENT` - "production"
- [ ] `PESAPAL_DEV_MODE` - "false"
- [ ] `CLOUDINARY_CLOUD_NAME` - Production account
- [ ] `CLOUDINARY_API_KEY` - Production key
- [ ] `CLOUDINARY_API_SECRET` - Production secret
- [ ] `PUSHER_APP_ID` - Production app
- [ ] `PUSHER_SECRET` - Production secret
- [ ] `NEXT_PUBLIC_PUSHER_KEY` - Production public key
- [ ] `RESEND_API_KEY` - Production key
- [ ] `EMAIL_FROM` - Verified production email

#### Verify in Vercel
```bash
# Check all environment variables are set
vercel env ls

# Pull production env (for verification only - don't commit)
vercel env pull .env.production --environment=production

# Verify and delete local file
cat .env.production
rm .env.production
```

---

### Code Security Verification

#### Security Headers
- [ ] `next.config.ts` has all security headers
- [ ] CSP allows only necessary domains
- [ ] HSTS enabled with preload
- [ ] X-Frame-Options configured

#### Rate Limiting
- [ ] Rate limiting implemented on:
  - [ ] `/api/auth/*` routes
  - [ ] `/api/bookings/*` routes
  - [ ] `/api/payments/*` routes
  - [ ] `/api/webhooks/*` routes
  - [ ] `/api/admin/*` routes

#### Authentication & Authorization
- [ ] All protected routes check authentication
- [ ] Admin routes check for ADMIN role
- [ ] Agent routes check for AGENT role and ownership
- [ ] Middleware protects frontend routes
- [ ] Brute force protection enabled

#### Input Validation
- [ ] All POST/PUT/PATCH routes use Zod schemas
- [ ] Text inputs are sanitized
- [ ] File uploads validate file type by magic bytes
- [ ] Date ranges are validated
- [ ] Amounts are validated as positive numbers

#### Error Handling
- [ ] No sensitive info in error messages
- [ ] Using `createSafeErrorResponse` in catch blocks
- [ ] No stack traces exposed in production
- [ ] Errors logged properly for debugging

---

### Database Security

- [ ] Database uses SSL connections (`sslmode=require`)
- [ ] Database password is strong (20+ characters)
- [ ] Database access restricted by IP (if possible)
- [ ] Connection pooling configured
- [ ] No raw SQL queries with user input
- [ ] All queries use Prisma (parameterized)

---

### File Security

- [ ] `.env` file NOT in git
- [ ] `.env.local` file NOT in git
- [ ] `prisma/dev.db` NOT in git
- [ ] No credentials in code
- [ ] No API keys hardcoded
- [ ] `.gitignore` properly configured

Verify:
```bash
git log --all --full-history -- .env
git log --all --full-history -- .env.local

# Should return no results. If found, they need to be purged from git history:
# git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env" --prune-empty --tag-name-filter cat -- --all
```

---

### Dependency Security

- [ ] Run `npm audit` and fix vulnerabilities
- [ ] All dependencies up to date
- [ ] No known critical vulnerabilities

```bash
npm audit --audit-level=high
npm outdated
```

---

### Vercel Configuration

#### Project Settings
- [ ] Environment variables set for production
- [ ] Different secrets for preview/production
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`
- [ ] Install command: `npm install`
- [ ] Node version: 20.x or latest LTS

#### Domain & SSL
- [ ] Custom domain configured
- [ ] SSL certificate auto-renewed (Vercel handles)
- [ ] HTTPS redirects enabled
- [ ] www redirect configured (if needed)

#### Deployment Protection
- [ ] Vercel authentication enabled (optional)
- [ ] Preview deployments require auth (optional)
- [ ] Production branch protected

---

### External Services Configuration

#### Pesapal
- [ ] IPN URL registered: `https://yourdomain.com/api/webhooks/pesapal`
- [ ] IPN ID saved in environment variables
- [ ] Test payment successful in sandbox
- [ ] Production credentials verified
- [ ] Webhook receiving and processing correctly

Test webhook:
```bash
# After deploying, check webhook endpoint
curl -X POST https://yourdomain.com/api/webhooks/pesapal \
  -H "Content-Type: application/json" \
  -d '{"OrderTrackingId":"test","OrderMerchantReference":"test","OrderNotificationType":"test"}'

# Should return proper error (not 500)
```

#### Cloudinary
- [ ] Upload preset configured
- [ ] Auto-optimization enabled
- [ ] Folder structure set up
- [ ] Access control configured
- [ ] Test upload works

#### Google OAuth
- [ ] Authorized redirect URIs include production domain
- [ ] `https://yourdomain.com/api/auth/callback/google`
- [ ] Consent screen configured
- [ ] Publishing status verified

#### Pusher (Real-time)
- [ ] App created for production
- [ ] Cluster configured correctly
- [ ] CORS domains configured
- [ ] Test connection works

#### Resend (Email)
- [ ] Production API key
- [ ] Domain verified
- [ ] SPF/DKIM configured
- [ ] Test email sends successfully

---

### Testing Before Going Live

#### Security Testing
```bash
# 1. Test rate limiting
for i in {1..15}; do curl -X POST https://your-preview-deployment.vercel.app/api/auth/signin; done
# Should see 429 after limit

# 2. Test authentication
curl https://your-preview-deployment.vercel.app/api/admin/users
# Should return 401

# 3. Test authorization
curl https://your-preview-deployment.vercel.app/api/admin/users \
  -H "Cookie: authjs.session-token=client-token"
# Should return 403

# 4. Test security headers
curl -I https://your-preview-deployment.vercel.app | grep -E "X-|Content-Security|Strict-Transport"
# Should see all security headers
```

#### Functional Testing
- [ ] User registration works
- [ ] User login works
- [ ] Google OAuth works
- [ ] Tour browsing works
- [ ] Booking creation works
- [ ] Payment initiation works (test mode)
- [ ] Webhook receives notifications
- [ ] Email confirmation sent
- [ ] Agent dashboard accessible
- [ ] Admin dashboard accessible

#### Performance Testing
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals pass
- [ ] Images optimized
- [ ] API response times < 500ms
- [ ] No memory leaks

---

### Post-Deployment Verification

#### Immediate Checks (within 5 minutes)
- [ ] Application loads at production URL
- [ ] HTTPS works (green lock icon)
- [ ] No console errors
- [ ] Login works
- [ ] Database connects successfully
- [ ] Images load from Cloudinary

#### Security Header Verification
Visit: https://securityheaders.com
- [ ] Enter your domain
- [ ] Aim for A or A+ rating
- [ ] Fix any missing headers

Visit: https://observatory.mozilla.org
- [ ] Scan your domain
- [ ] Check recommendations

#### SSL/TLS Verification
Visit: https://www.ssllabs.com/ssltest/
- [ ] Enter your domain
- [ ] Aim for A or A+ rating
- [ ] Check certificate validity

#### Monitoring Setup
- [ ] Error tracking configured (Sentry recommended)
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring configured
- [ ] Email alerts for downtime
- [ ] Webhook for critical errors

---

### Ongoing Security Maintenance

#### Daily
- [ ] Check error logs
- [ ] Monitor failed login attempts
- [ ] Check webhook success rate

#### Weekly
- [ ] Review audit logs
- [ ] Check for unusual activity
- [ ] Monitor API usage patterns
- [ ] Check rate limit hits

#### Monthly
- [ ] Run `npm audit` and update dependencies
- [ ] Review user access levels
- [ ] Check database performance
- [ ] Review and rotate API keys (if needed)
- [ ] Check SSL certificate expiry (Vercel auto-renews)

#### Quarterly
- [ ] Full security audit
- [ ] Penetration testing (if budget allows)
- [ ] Review and update security policies
- [ ] Update security documentation
- [ ] Review OWASP Top 10

---

## 🚀 Deployment Commands

### Deploy to Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Link project (first time only)
vercel link

# 4. Set environment variables
vercel env add AUTH_SECRET production
vercel env add DATABASE_URL production
# ... repeat for all variables

# 5. Deploy to production
vercel --prod

# 6. Verify deployment
vercel ls

# 7. Check deployment logs
vercel logs
```

### Rollback if Issues

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote <deployment-url>
```

---

## 🆘 Emergency Response

### If Credentials Are Compromised

1. **Immediately:**
   - [ ] Rotate compromised credentials
   - [ ] Deploy with new credentials
   - [ ] Revoke old credentials
   - [ ] Force logout all users (change AUTH_SECRET)

2. **Investigation:**
   - [ ] Check audit logs for unauthorized access
   - [ ] Check payment records for fraud
   - [ ] Review database for unauthorized changes
   - [ ] Check for data exfiltration

3. **Communication:**
   - [ ] Notify team
   - [ ] Document incident
   - [ ] Notify users if personal data affected (GDPR)
   - [ ] File security incident report

### If Application is Down

1. **Check:**
   - [ ] Vercel status: https://vercel-status.com
   - [ ] Database status
   - [ ] External service status (Cloudinary, Pesapal, etc.)

2. **Rollback:**
   ```bash
   vercel ls
   vercel promote <previous-deployment-url>
   ```

3. **Debug:**
   ```bash
   vercel logs
   ```

---

## ✅ Final Sign-Off

Before clicking "Deploy to Production":

- [ ] All checklist items completed
- [ ] All credentials rotated
- [ ] All environment variables set
- [ ] Security testing passed
- [ ] Functional testing passed
- [ ] Team reviewed and approved
- [ ] Backup plan in place
- [ ] Monitoring configured
- [ ] Emergency contacts available

**Deployment Date:** _______________

**Deployed By:** _______________

**Approved By:** _______________

---

## 📞 Emergency Contacts

- **Tech Lead:** _______________ (Phone: _______________)
- **Security Lead:** _______________ (Phone: _______________)
- **Database Admin:** _______________ (Phone: _______________)
- **Vercel Support:** support@vercel.com
- **Neon Support:** https://neon.tech/support

---

**Remember: Security is a continuous process, not a one-time task.**

After deployment, continue monitoring, updating, and improving security measures.

---

**Status: Ready for Production Deployment ✓**

*Last Updated: January 13, 2026*
