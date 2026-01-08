#!/bin/bash

# Pesapal Integration Verification Script
# Run this to verify your Pesapal setup is correct

echo "🔍 Verifying Pesapal Integration Setup..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check file exists
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $2"
  else
    echo -e "${RED}✗${NC} $2"
    ERRORS=$((ERRORS+1))
  fi
}

# Function to check env var is set
check_env() {
  if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠${NC} .env.local not found (using .env)"
    if [ ! -f .env ]; then
      echo -e "${RED}✗${NC} No .env or .env.local file found!"
      ERRORS=$((ERRORS+1))
      return
    fi
    ENV_FILE=".env"
  else
    ENV_FILE=".env.local"
  fi

  if grep -q "^$1=" "$ENV_FILE" 2>/dev/null; then
    VALUE=$(grep "^$1=" "$ENV_FILE" | cut -d '=' -f2-)
    if [ -n "$VALUE" ]; then
      echo -e "${GREEN}✓${NC} $1 is set"
    else
      echo -e "${YELLOW}⚠${NC} $1 is defined but empty"
      WARNINGS=$((WARNINGS+1))
    fi
  else
    echo -e "${RED}✗${NC} $1 is not set"
    ERRORS=$((ERRORS+1))
  fi
}

# 1. Check Required Files
echo "📁 Checking Required Files..."
check_file "src/lib/pesapal/index.ts" "Pesapal Client Library"
check_file "src/app/api/payments/initiate/route.ts" "Payment Initiation API"
check_file "src/app/api/webhooks/pesapal/route.ts" "Pesapal Webhook Handler"
check_file "src/app/api/payments/status/route.ts" "Payment Status API"
echo ""

# 2. Check Environment Variables
echo "🔐 Checking Environment Variables..."
check_env "PESAPAL_CONSUMER_KEY"
check_env "PESAPAL_CONSUMER_SECRET"
check_env "PESAPAL_IPN_URL"
check_env "PESAPAL_IPN_ID"
check_env "PESAPAL_API_URL"
check_env "NEXT_PUBLIC_APP_URL"
echo ""

# 3. Check TypeScript Compilation
echo "📝 Checking TypeScript Compilation..."
if command -v npx &> /dev/null; then
  if npx tsc --noEmit --skipLibCheck 2>&1 | grep -q "error TS"; then
    echo -e "${RED}✗${NC} TypeScript compilation has errors"
    ERRORS=$((ERRORS+1))
  else
    echo -e "${GREEN}✓${NC} TypeScript compilation successful"
  fi
else
  echo -e "${YELLOW}⚠${NC} npx not found, skipping TypeScript check"
  WARNINGS=$((WARNINGS+1))
fi
echo ""

# 4. Check Database Schema
echo "🗄️  Checking Database Schema..."
if [ -f "prisma/schema.prisma" ]; then
  if grep -q "model Payment" prisma/schema.prisma; then
    echo -e "${GREEN}✓${NC} Payment model exists in schema"

    # Check required fields
    if grep -A 20 "model Payment" prisma/schema.prisma | grep -q "pesapalTrackingId"; then
      echo -e "${GREEN}✓${NC} pesapalTrackingId field exists"
    else
      echo -e "${RED}✗${NC} pesapalTrackingId field missing"
      ERRORS=$((ERRORS+1))
    fi

    if grep -A 20 "model Payment" prisma/schema.prisma | grep -q "pesapalMerchantRef"; then
      echo -e "${GREEN}✓${NC} pesapalMerchantRef field exists"
    else
      echo -e "${RED}✗${NC} pesapalMerchantRef field missing"
      ERRORS=$((ERRORS+1))
    fi

    if grep -A 20 "model Payment" prisma/schema.prisma | grep -q "pesapalOrderId"; then
      echo -e "${GREEN}✓${NC} pesapalOrderId field exists"
    else
      echo -e "${RED}✗${NC} pesapalOrderId field missing"
      ERRORS=$((ERRORS+1))
    fi
  else
    echo -e "${RED}✗${NC} Payment model not found in schema"
    ERRORS=$((ERRORS+1))
  fi
else
  echo -e "${RED}✗${NC} prisma/schema.prisma not found"
  ERRORS=$((ERRORS+1))
fi
echo ""

# 5. Check Documentation
echo "📚 Checking Documentation..."
check_file "docs/pesapal-integration.md" "Main Pesapal Documentation"
check_file "docs/backend/pesapal-implementation-summary.md" "Implementation Summary"
check_file "docs/backend/pesapal-security-audit.md" "Security Audit"
check_file "docs/backend/PESAPAL-QUICK-START.md" "Quick Start Guide"
echo ""

# 6. Check Dependencies
echo "📦 Checking Dependencies..."
if [ -f "package.json" ]; then
  if grep -q "\"zod\"" package.json; then
    echo -e "${GREEN}✓${NC} Zod (validation) installed"
  else
    echo -e "${YELLOW}⚠${NC} Zod might not be installed"
    WARNINGS=$((WARNINGS+1))
  fi

  if grep -q "\"@prisma/client\"" package.json; then
    echo -e "${GREEN}✓${NC} Prisma Client installed"
  else
    echo -e "${RED}✗${NC} Prisma Client not installed"
    ERRORS=$((ERRORS+1))
  fi
else
  echo -e "${RED}✗${NC} package.json not found"
  ERRORS=$((ERRORS+1))
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed! Pesapal integration is ready.${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Start your development server: npm run dev"
  echo "2. Expose webhook URL with ngrok: ngrok http 3000"
  echo "3. Update PESAPAL_IPN_URL in .env.local with ngrok URL"
  echo "4. Test a payment with sandbox credentials"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠️  All critical checks passed with $WARNINGS warning(s).${NC}"
  echo ""
  echo "Review warnings above and proceed with caution."
  exit 0
else
  echo -e "${RED}❌ $ERRORS error(s) and $WARNINGS warning(s) found.${NC}"
  echo ""
  echo "Please fix the errors above before proceeding."
  exit 1
fi
