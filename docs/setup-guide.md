# SafariPlus - Developer Setup Guide

This guide provides comprehensive instructions for setting up your local development environment for the SafariPlus platform.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Start](#2-quick-start)
3. [Environment Variables](#3-environment-variables)
4. [Third-Party Account Setup](#4-third-party-account-setup)
5. [Database Setup](#5-database-setup)
6. [Running the Project](#6-running-the-project)
7. [Project Structure](#7-project-structure)
8. [VS Code Setup](#8-vs-code-setup)
9. [Troubleshooting](#9-troubleshooting)
10. [Deployment](#10-deployment)

---

## 1. Prerequisites

### Required Software

| Software | Version | Purpose | Installation |
|----------|---------|---------|--------------|
| Node.js | 20.x LTS | JavaScript runtime | [nodejs.org](https://nodejs.org/) |
| Git | Latest | Version control | [git-scm.com](https://git-scm.com/) |
| VS Code | Latest | Code editor (recommended) | [code.visualstudio.com](https://code.visualstudio.com/) |

### Verify Installation

```bash
# Check Node.js version (should be 20.x)
node --version

# Check npm version (should be 10.x or higher)
npm --version

# Check Git version
git --version
```

### Package Manager Recommendation

We recommend using **npm** (comes with Node.js) for consistency across the team. However, pnpm is also supported if preferred.

```bash
# If using pnpm (optional)
npm install -g pnpm
```

### Database Options

Choose one of the following PostgreSQL options:

| Option | Best For | Setup Complexity |
|--------|----------|------------------|
| **Neon** (Recommended) | Development, serverless | Easy |
| **Supabase** | Development with additional features | Easy |
| **Local PostgreSQL** | Offline development | Medium |
| **Railway** | Quick prototyping | Easy |

---

## 2. Quick Start

### Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-org/safariplus.git

# Navigate to project directory
cd safariplus

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Generate Prisma client
npx prisma generate

# Push database schema (after configuring DATABASE_URL)
npx prisma db push

# Seed the database with sample data
npx prisma db seed

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

---

## 3. Environment Variables

### Complete Environment Template

Create a `.env.local` file in the project root with the following variables:

```env
# ==============================================================================
# DATABASE
# ==============================================================================

# PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://username:password@localhost:5432/safariplus?schema=public"

# Direct URL for Prisma migrations (same as DATABASE_URL for local)
DIRECT_URL="postgresql://username:password@localhost:5432/safariplus?schema=public"


# ==============================================================================
# AUTHENTICATION (NextAuth.js v5)
# ==============================================================================

# Base URL of your application
NEXTAUTH_URL="http://localhost:3000"

# Secret for JWT encryption (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-super-secret-key-min-32-characters"


# ==============================================================================
# GOOGLE OAUTH
# ==============================================================================

# Google Cloud Console credentials
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"


# ==============================================================================
# PESAPAL PAYMENT GATEWAY (Critical)
# ==============================================================================

# Consumer credentials from Pesapal dashboard
PESAPAL_CONSUMER_KEY="your-pesapal-consumer-key"
PESAPAL_CONSUMER_SECRET="your-pesapal-consumer-secret"

# IPN (Instant Payment Notification) callback URL
PESAPAL_IPN_URL="https://your-domain.com/api/webhooks/pesapal"

# IPN ID (obtained after registering IPN URL)
PESAPAL_IPN_ID="your-ipn-id"

# Environment: "sandbox" for testing, "production" for live
PESAPAL_ENVIRONMENT="sandbox"

# API URLs (automatically set based on environment)
# Sandbox: https://cybqa.pesapal.com/pesapalv3
# Production: https://pay.pesapal.com/v3
PESAPAL_API_URL="https://cybqa.pesapal.com/pesapalv3"


# ==============================================================================
# CLOUDINARY (Image Storage)
# ==============================================================================

# Cloudinary account credentials
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Upload preset for unsigned uploads (optional)
CLOUDINARY_UPLOAD_PRESET="safariplus_uploads"


# ==============================================================================
# PUSHER (Real-time Messaging) - Phase 2
# ==============================================================================

# Pusher app credentials
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_SECRET="your-pusher-secret"

# Public keys (accessible in browser)
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="mt1"


# ==============================================================================
# EMAIL SERVICE (Resend)
# ==============================================================================

# Resend API key for transactional emails
RESEND_API_KEY="re_your-resend-api-key"

# From email address (must be verified domain)
EMAIL_FROM="SafariPlus <noreply@safariplus.com>"


# ==============================================================================
# APPLICATION SETTINGS
# ==============================================================================

# Public URL of the application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Application name
NEXT_PUBLIC_APP_NAME="SafariPlus"

# Default currency
NEXT_PUBLIC_DEFAULT_CURRENCY="KES"

# Supported currencies (comma-separated)
NEXT_PUBLIC_SUPPORTED_CURRENCIES="KES,USD,TZS,UGX"


# ==============================================================================
# PLATFORM CONFIGURATION
# ==============================================================================

# Platform commission percentage (e.g., 15 = 15%)
PLATFORM_COMMISSION_RATE="15"

# Minimum withdrawal amount in USD
MIN_WITHDRAWAL_AMOUNT="50"


# ==============================================================================
# MONITORING & ANALYTICS (Optional)
# ==============================================================================

# Sentry for error tracking
NEXT_PUBLIC_SENTRY_DSN="https://your-sentry-dsn@sentry.io/project"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"

# Vercel Analytics (automatically configured on Vercel)
# No configuration needed


# ==============================================================================
# DEVELOPMENT SETTINGS
# ==============================================================================

# Enable debug mode
DEBUG="false"

# Log level: debug, info, warn, error
LOG_LEVEL="info"
```

### Environment Variable Categories

| Category | Required for Dev | Required for Prod |
|----------|------------------|-------------------|
| Database | Yes | Yes |
| NextAuth | Yes | Yes |
| Google OAuth | No (use credentials auth) | Yes |
| Pesapal | Yes (sandbox) | Yes (production) |
| Cloudinary | Yes | Yes |
| Pusher | No (Phase 2) | No (Phase 2) |
| Resend | No (mock in dev) | Yes |
| Monitoring | No | Recommended |

---

## 4. Third-Party Account Setup

### 4.1 Pesapal (Critical - Payment Gateway)

Pesapal is the primary payment gateway for SafariPlus, supporting M-Pesa, Airtel Money, and cards.

#### Step 1: Create a Business Account

1. Visit [pesapal.com/business](https://www.pesapal.com/business)
2. Click "Sign Up" and select your country
3. Fill in business details:
   - Business name
   - Business registration number
   - Contact information
   - Bank account for settlements
4. Complete KYC verification (1-3 business days)

#### Step 2: Access the Dashboard

1. Log in to [dashboard.pesapal.com](https://dashboard.pesapal.com)
2. Navigate to "Settings" > "API Credentials"
3. You will see both Sandbox and Live credentials

#### Step 3: Sandbox vs Production

| Environment | Use Case | API URL |
|-------------|----------|---------|
| Sandbox | Development & Testing | `https://cybqa.pesapal.com/pesapalv3` |
| Production | Live transactions | `https://pay.pesapal.com/v3` |

**Important**: Always use Sandbox for development. Switch to Production only when going live.

#### Step 4: Get API Keys

1. In the dashboard, go to "API Credentials"
2. Copy `Consumer Key` and `Consumer Secret`
3. For Sandbox, use the dedicated sandbox credentials

#### Step 5: Register IPN Callback URL

The IPN (Instant Payment Notification) URL receives payment status updates.

```bash
# For local development, use ngrok to expose your local server
ngrok http 3000

# Your IPN URL will be: https://your-ngrok-url.ngrok.io/api/webhooks/pesapal
```

**Register via API:**

```typescript
// This is done programmatically on first deployment
// Or manually via Pesapal dashboard > Settings > IPN
```

#### Step 6: Test with Sandbox

| Payment Method | Test Credentials |
|----------------|------------------|
| M-Pesa | Phone: 0700000000 to 0700000003 |
| Visa | Card: 4111111111111111, Exp: Any future, CVV: 123 |
| Mastercard | Card: 5500000000000004, Exp: Any future, CVV: 123 |

---

### 4.2 Cloudinary (Image Storage)

#### Step 1: Create Account

1. Visit [cloudinary.com](https://cloudinary.com)
2. Click "Sign Up for Free"
3. Complete registration

#### Step 2: Get Credentials

1. Log in to the Cloudinary Console
2. On the Dashboard, you'll see:
   - Cloud Name
   - API Key
   - API Secret

#### Step 3: Configure Upload Preset (Optional)

For unsigned uploads from the client:

1. Go to "Settings" > "Upload"
2. Scroll to "Upload presets"
3. Click "Add upload preset"
4. Configure:
   - Preset name: `safariplus_uploads`
   - Signing Mode: `Unsigned`
   - Folder: `safariplus`
   - Allowed formats: `jpg, png, webp, avif`
   - Max file size: `10MB`

#### Step 4: Configure Transformations

For optimal image delivery, set up named transformations:

| Transformation | Settings |
|----------------|----------|
| `tour_thumbnail` | w_400, h_300, c_fill, q_auto, f_auto |
| `tour_hero` | w_1200, h_800, c_fill, q_auto, f_auto |
| `avatar` | w_200, h_200, c_fill, g_face, q_auto, f_auto |

---

### 4.3 Google OAuth

#### Step 1: Create Google Cloud Project

1. Visit [console.cloud.google.com](https://console.cloud.google.com)
2. Click "Select a project" > "New Project"
3. Name it "SafariPlus" and create

#### Step 2: Enable Google+ API

1. Go to "APIs & Services" > "Library"
2. Search for "Google+ API" and enable it
3. Also enable "Google Identity Toolkit API"

#### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type
3. Fill in:
   - App name: SafariPlus
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `email`
   - `profile`
   - `openid`
5. Add test users (for development)

#### Step 4: Create Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: "Web application"
4. Name: "SafariPlus Web"
5. Add Authorized JavaScript origins:
   ```
   http://localhost:3000
   https://your-domain.com
   ```
6. Add Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-domain.com/api/auth/callback/google
   ```
7. Copy Client ID and Client Secret

---

### 4.4 PostgreSQL Options

#### Option A: Neon (Recommended for Development)

Neon provides serverless PostgreSQL with automatic scaling.

1. Visit [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create a new project
4. Copy the connection string:
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
5. Use the same string for both `DATABASE_URL` and `DIRECT_URL`

**Neon Advantages:**
- Free tier with 0.5 GB storage
- Automatic connection pooling
- Branch databases for testing
- Serverless (scales to zero)

#### Option B: Supabase

1. Visit [supabase.com](https://supabase.com)
2. Create a new project
3. Go to "Settings" > "Database"
4. Copy the connection strings:
   - `DATABASE_URL`: Use the "Connection pooling" string
   - `DIRECT_URL`: Use the "Direct connection" string

#### Option C: Local PostgreSQL

**macOS (using Homebrew):**

```bash
# Install PostgreSQL
brew install postgresql@16

# Start the service
brew services start postgresql@16

# Create database
createdb safariplus

# Connection string
DATABASE_URL="postgresql://$(whoami)@localhost:5432/safariplus"
```

**Windows:**

1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer
3. Remember the password you set for the `postgres` user
4. Create database using pgAdmin or command line

**Linux (Ubuntu/Debian):**

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql

# Create user and database
sudo -u postgres createuser --interactive
sudo -u postgres createdb safariplus
```

#### Connection String Format

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public&sslmode=require
```

| Component | Description |
|-----------|-------------|
| USER | Database username |
| PASSWORD | Database password (URL encoded if special chars) |
| HOST | Database server hostname |
| PORT | Database port (default: 5432) |
| DATABASE | Database name |
| schema | PostgreSQL schema (default: public) |
| sslmode | SSL mode (require for cloud DBs) |

---

### 4.5 Pusher (Phase 2 - Real-time Messaging)

#### Step 1: Create Account

1. Visit [pusher.com](https://pusher.com)
2. Sign up for free
3. Go to "Channels" product

#### Step 2: Create App

1. Click "Create app"
2. Configure:
   - App name: SafariPlus
   - Cluster: Select closest to your users (e.g., `mt1` for Africa)
   - Frontend: React
   - Backend: Node.js
3. Create

#### Step 3: Get Credentials

From the "App Keys" section, copy:
- App ID
- Key (public)
- Secret
- Cluster

#### Step 4: Enable Features

In "App Settings", enable:
- Client events (for typing indicators)
- Authorized connections

---

### 4.6 Resend (Email Service)

#### Step 1: Create Account

1. Visit [resend.com](https://resend.com)
2. Sign up with GitHub
3. Verify your email

#### Step 2: Get API Key

1. Go to "API Keys"
2. Click "Create API Key"
3. Name: "SafariPlus"
4. Permissions: "Full access"
5. Copy the key (shown only once)

#### Step 3: Add Domain (Production)

For production, verify your sending domain:

1. Go to "Domains"
2. Add your domain
3. Add the DNS records provided
4. Wait for verification

---

## 5. Database Setup

### Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# Seed with sample data
npx prisma db seed
```

### Prisma Commands Reference

| Command | Purpose |
|---------|---------|
| `npx prisma generate` | Generate Prisma client from schema |
| `npx prisma db push` | Push schema changes (development) |
| `npx prisma migrate dev` | Create migration (production workflow) |
| `npx prisma migrate deploy` | Apply migrations (CI/CD) |
| `npx prisma studio` | Open visual database browser |
| `npx prisma db seed` | Run seed script |
| `npx prisma format` | Format schema file |

### Database Studio

View and edit your data visually:

```bash
npx prisma studio
```

This opens a browser interface at `http://localhost:5555`

### Reset Database

To reset and re-seed:

```bash
npx prisma db push --force-reset
npx prisma db seed
```

**Warning**: This deletes all data. Use only in development.

---

## 6. Running the Project

### Development Mode

```bash
# Start development server with hot reload
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

### Other Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run type-check` | Run TypeScript checks |
| `npm run format` | Format code with Prettier |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |

### Running with Different Environments

```bash
# Development (default)
npm run dev

# With specific environment file
NODE_ENV=development npm run dev

# Production mode locally
npm run build && npm start
```

---

## 7. Project Structure

```
safariplus/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   ├── verify-email/
│   │   └── forgot-password/
│   ├── (client)/                 # Client-facing pages
│   │   ├── tours/
│   │   ├── book/
│   │   ├── bookings/
│   │   ├── messages/
│   │   └── profile/
│   ├── (agent)/                  # Agent dashboard
│   │   └── agent/
│   │       ├── dashboard/
│   │       ├── tours/
│   │       ├── bookings/
│   │       ├── earnings/
│   │       └── settings/
│   ├── (admin)/                  # Admin dashboard
│   │   └── admin/
│   │       ├── dashboard/
│   │       ├── agents/
│   │       ├── withdrawals/
│   │       └── settings/
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/
│   │   ├── tours/
│   │   ├── bookings/
│   │   ├── payments/
│   │   └── webhooks/
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── forms/                    # Form components
│   ├── tours/                    # Tour-related components
│   ├── bookings/                 # Booking components
│   ├── dashboard/                # Dashboard widgets
│   ├── layout/                   # Layout components
│   └── shared/                   # Shared components
├── lib/                          # Utility libraries
│   ├── prisma.ts                 # Prisma client
│   ├── auth.ts                   # NextAuth config
│   ├── pesapal.ts                # Pesapal client
│   ├── cloudinary.ts             # Image uploads
│   ├── pusher.ts                 # Real-time client
│   ├── email.ts                  # Email utilities
│   ├── utils.ts                  # General utilities
│   └── validations/              # Zod schemas
├── hooks/                        # Custom React hooks
│   ├── use-auth.ts
│   ├── use-tours.ts
│   └── use-bookings.ts
├── types/                        # TypeScript types
│   ├── tour.ts
│   ├── booking.ts
│   └── user.ts
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Migration files
│   └── seed.ts                   # Seed data
├── public/                       # Static assets
│   ├── images/
│   └── icons/
├── config/                       # Configuration
│   ├── site.ts                   # Site metadata
│   ├── navigation.ts             # Navigation config
│   └── constants.ts              # App constants
├── middleware.ts                 # Auth middleware
├── next.config.js                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
├── package.json
└── .env.local                    # Environment variables
```

### Key Files

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout with providers |
| `middleware.ts` | Route protection and redirects |
| `lib/prisma.ts` | Database client singleton |
| `lib/auth.ts` | Authentication configuration |
| `prisma/schema.prisma` | Database schema definition |

---

## 8. VS Code Setup

### Recommended Extensions

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "dsznajder.es7-react-js-snippets",
    "formulahendry.auto-rename-tag",
    "usernamehw.errorlens",
    "mikestead.dotenv",
    "christian-kohler.path-intellisense",
    "streetsidesoftware.code-spell-checker",
    "gruntfuggly.todo-tree",
    "GitHub.copilot"
  ]
}
```

### Workspace Settings

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ],
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  },
  "editor.quickSuggestions": {
    "strings": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  }
}
```

### ESLint Configuration

The project uses ESLint with Next.js recommended rules. Key configurations:

```javascript
// eslint.config.js or .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "warn",
    "react/no-unescaped-entities": "off"
  }
}
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

---

## 9. Troubleshooting

### Common Issues and Solutions

#### Database Connection Errors

**Error**: `Can't reach database server at localhost:5432`

**Solutions**:
1. Ensure PostgreSQL is running:
   ```bash
   # macOS
   brew services start postgresql@16

   # Linux
   sudo systemctl start postgresql
   ```
2. Check connection string format
3. For cloud DBs, ensure IP is whitelisted

---

**Error**: `P1001: Can't reach database server`

**Solutions**:
1. Check if using correct DATABASE_URL
2. For Neon/Supabase, ensure `?sslmode=require` is in URL
3. Check firewall settings

---

#### Prisma Issues

**Error**: `Prisma Client is not generated`

**Solution**:
```bash
npx prisma generate
```

---

**Error**: `The database schema is not in sync`

**Solution**:
```bash
npx prisma db push
```

---

**Error**: `Unique constraint failed`

**Solution**:
Reset and re-seed the database:
```bash
npx prisma db push --force-reset
npx prisma db seed
```

---

#### Authentication Errors

**Error**: `NEXTAUTH_SECRET is not set`

**Solution**:
Generate a secret:
```bash
openssl rand -base64 32
```
Add to `.env.local`:
```
NEXTAUTH_SECRET="your-generated-secret"
```

---

**Error**: `OAuth error: redirect_uri_mismatch`

**Solution**:
1. Check Google Cloud Console > Credentials
2. Ensure redirect URI matches exactly:
   ```
   http://localhost:3000/api/auth/callback/google
   ```

---

#### Pesapal Issues

**Error**: `Invalid consumer key or secret`

**Solutions**:
1. Verify using Sandbox credentials for development
2. Check for extra spaces in environment variables
3. Ensure using correct API URL for environment

---

**Error**: `IPN URL not registered`

**Solution**:
Register IPN URL via Pesapal dashboard or API before processing payments.

---

#### Build Errors

**Error**: `Module not found: Can't resolve...`

**Solutions**:
1. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```
2. Check for typos in import paths
3. Ensure all dependencies are installed

---

**Error**: `Type error: Property X does not exist on type Y`

**Solutions**:
1. Regenerate Prisma types:
   ```bash
   npx prisma generate
   ```
2. Restart TypeScript server in VS Code (Cmd+Shift+P > "Restart TS Server")

---

#### Environment Variable Issues

**Error**: `Environment variable X is not defined`

**Solutions**:
1. Ensure variable is in `.env.local` (not `.env`)
2. Restart the development server
3. For client-side variables, prefix with `NEXT_PUBLIC_`

---

### Debug Mode

Enable detailed logging:

```env
DEBUG=true
LOG_LEVEL=debug
```

### Getting Help

1. Check existing documentation in `/docs`
2. Search issues on GitHub
3. Ask in team Slack channel
4. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details

---

## 10. Deployment

### Vercel Deployment (Recommended)

Vercel is the recommended hosting platform for Next.js applications.

#### Step 1: Connect Repository

1. Visit [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import the safariplus repository

#### Step 2: Configure Build Settings

Vercel auto-detects Next.js. Default settings should work:

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |

#### Step 3: Add Environment Variables

In Vercel project settings > Environment Variables, add all variables from your `.env.local`:

**Required for Production**:
- `DATABASE_URL` (use production database)
- `DIRECT_URL` (same as DATABASE_URL for pooled connections)
- `NEXTAUTH_URL` (your production domain)
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `PESAPAL_CONSUMER_KEY` (production keys)
- `PESAPAL_CONSUMER_SECRET` (production keys)
- `PESAPAL_IPN_URL` (production URL)
- `PESAPAL_ENVIRONMENT=production`
- `PESAPAL_API_URL=https://pay.pesapal.com/v3`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL` (production domain)

#### Step 4: Configure Database for Production

For Neon:
1. Create a production branch in Neon
2. Use the pooled connection string for `DATABASE_URL`
3. Enable connection pooling

For Supabase:
1. Use the connection pooler URL for `DATABASE_URL`
2. Use direct connection for `DIRECT_URL`

#### Step 5: Deploy

```bash
# Via Git push
git push origin main

# Or via Vercel CLI
npx vercel --prod
```

#### Step 6: Run Migrations

After first deployment:

```bash
# Using Vercel CLI
npx vercel env pull .env.production.local
npx prisma migrate deploy
```

### Domain Configuration

1. In Vercel, go to project > Settings > Domains
2. Add your domain (e.g., `safariplus.com`)
3. Configure DNS:
   - Add CNAME record: `www` -> `cname.vercel-dns.com`
   - Add A record: `@` -> Vercel's IP

### Environment-Specific Configuration

| Environment | Branch | URL |
|-------------|--------|-----|
| Production | `main` | safariplus.com |
| Staging | `develop` | staging.safariplus.com |
| Preview | PR branches | *.vercel.app |

### CI/CD Pipeline

Vercel automatically:
- Builds on every push
- Creates preview deployments for PRs
- Deploys to production on main branch merge

### Post-Deployment Checklist

- [ ] Verify database connection
- [ ] Test authentication flow
- [ ] Test payment flow in production mode
- [ ] Verify email sending
- [ ] Check image uploads
- [ ] Monitor error tracking (Sentry)
- [ ] Set up uptime monitoring

---

## Next Steps

After completing setup:

1. Review the [Technical Architecture](./technical-architecture.md)
2. Read the [Implementation Guide](./implementation-guide.md)
3. Check assigned tasks in [Developer Tasks](./developer-tasks.md)
4. Familiarize yourself with the [Database Schema](./database-schema.md)

---

## Document Information

| Field | Value |
|-------|-------|
| Created | 2025-01-07 |
| Last Updated | 2025-01-07 |
| Version | 1.0 |
| Status | Active |
