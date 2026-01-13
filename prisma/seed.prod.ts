import { PrismaClient, AccommodationTier } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

/**
 * Production Seed Script
 * ----------------------
 * This creates minimal production data:
 * - Admin user only (credentials from environment)
 * - Platform settings
 *
 * Agents and tours should be created via the UI
 */
async function main() {
  console.log("🌱 Starting PRODUCTION database seed...")

  // Get admin credentials from environment or use secure defaults
  const adminEmail = process.env.PROD_ADMIN_EMAIL || "admin@safariplus.com"
  const adminPasswordPlain = process.env.PROD_ADMIN_PASSWORD

  if (!adminPasswordPlain) {
    console.error("❌ PROD_ADMIN_PASSWORD environment variable is required for production seed!")
    console.error("   Set it before running: PROD_ADMIN_PASSWORD=your_secure_password npm run db:seed:prod")
    process.exit(1)
  }

  const adminPassword = await bcrypt.hash(adminPasswordPlain, 12)

  // Create Admin User only
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminPassword, // Update password in case it changed
    },
    create: {
      email: adminEmail,
      name: "SafariPlus Admin",
      firstName: "SafariPlus",
      lastName: "Admin",
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  })
  console.log("✅ Created/updated admin user:", adminUser.email)

  // Create platform settings
  const settings = await prisma.platformSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      defaultCommissionRate: 12.0,
      minWithdrawalAmount: 50.0,
      supportEmail: process.env.SUPPORT_EMAIL || "support@safariplus.com",
      supportPhone: process.env.SUPPORT_PHONE || "+254 700 000 000",
    },
  })
  console.log("✅ Created platform settings")
  console.log(`   - Commission Rate: ${settings.defaultCommissionRate}%`)
  console.log(`   - Min Withdrawal: $${settings.minWithdrawalAmount}`)

  console.log("\n🎉 Production database seeding completed!")
  console.log("\n⚠️  IMPORTANT:")
  console.log("-----------------------------------")
  console.log("Admin credentials have been set.")
  console.log("Please login and change your password immediately.")
  console.log("-----------------------------------\n")
}

main()
  .catch((e) => {
    console.error("❌ Production seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
