# Vercel Deployment Security Setup

## Required Environment Variables

Set these in Vercel Dashboard > Project > Settings > Environment Variables:

### Authentication (CRITICAL)
```
AUTH_SECRET=<generate-new-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://your-domain.vercel.app
```

### Database
```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### Application
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

### Google OAuth
```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Cloudinary
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=safariplus_uploads
```

### Pesapal Payment
```
PESAPAL_CONSUMER_KEY=your-consumer-key
PESAPAL_CONSUMER_SECRET=your-consumer-secret
PESAPAL_IPN_ID=your-ipn-id
NEXT_PUBLIC_PESAPAL_ENV=live
```

### Email (Resend)
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### Pusher (Real-time)
```
NEXT_PUBLIC_PUSHER_APP_KEY=your-app-key
PUSHER_APP_ID=your-app-id
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=mt1
```

---

## Security Checklist for Vercel

### 1. Environment Variables Security
- [ ] All secrets are in Vercel Environment Variables (not in code)
- [ ] Different values for Production vs Preview vs Development
- [ ] AUTH_SECRET is unique and randomly generated
- [ ] No secrets committed to git

### 2. Domain Security
- [ ] Custom domain configured with SSL
- [ ] Force HTTPS redirects enabled
- [ ] HSTS preload submitted (optional)

### 3. Access Control
- [ ] Vercel team members have appropriate roles
- [ ] Preview deployments protected (if needed)
- [ ] Production branch protection enabled

### 4. Monitoring
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured
- [ ] Uptime monitoring set up

---

## Generate New Secrets

```bash
# Generate AUTH_SECRET
openssl rand -base64 32

# Generate random password
openssl rand -hex 16
```

---

## Vercel Security Features to Enable

1. **Go to Vercel Dashboard > Project > Settings**

2. **Security Tab:**
   - Enable "Deployment Protection"
   - Set "Preview Deployment Protection" if needed

3. **General Tab:**
   - Ensure "Build & Development Settings" use Node.js 20+

4. **Domains Tab:**
   - Add custom domain
   - Enable automatic HTTPS

5. **Environment Variables Tab:**
   - Set all variables for Production
   - Use different secrets for Preview/Development

---

## Post-Deployment Verification

```bash
# Test security headers
curl -I https://your-domain.vercel.app

# Expected headers:
# strict-transport-security: max-age=63072000...
# x-frame-options: SAMEORIGIN
# x-content-type-options: nosniff
# x-xss-protection: 1; mode=block
# referrer-policy: strict-origin-when-cross-origin

# Test API protection
curl https://your-domain.vercel.app/api/admin/users
# Should return 401 Unauthorized

# Test rate limiting
for i in {1..15}; do
  curl -X POST https://your-domain.vercel.app/api/auth/signin
done
# Should start getting rate limited
```

---

## Webhook Security

### Pesapal IPN Configuration
1. Log into Pesapal Dashboard
2. Set IPN URL: `https://your-domain.vercel.app/api/webhooks/pesapal`
3. Note the IPN ID and add to Vercel env vars

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel
- Ensure all env vars are set
- Verify DATABASE_URL is accessible from Vercel

### Auth Not Working
- Verify NEXTAUTH_URL matches your domain exactly
- Check AUTH_SECRET is set
- Verify Google OAuth callback URL includes Vercel domain

### Database Connection Issues
- Ensure DATABASE_URL has `?sslmode=require`
- Check Neon allows connections from Vercel IPs
- Verify connection pooling settings
