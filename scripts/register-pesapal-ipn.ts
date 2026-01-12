/**
 * Script to register IPN URL with Pesapal
 * Run with: npx tsx scripts/register-pesapal-ipn.ts
 */

import "dotenv/config"

const PESAPAL_API_URL = process.env.PESAPAL_API_URL || "https://cybqa.pesapal.com/pesapalv3"
const CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY
const CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET
const IPN_URL = process.env.PESAPAL_IPN_URL || "http://localhost:3000/api/webhooks/pesapal"

async function main() {
  console.log("🔐 Registering IPN with Pesapal...")
  console.log(`   API URL: ${PESAPAL_API_URL}`)
  console.log(`   IPN URL: ${IPN_URL}`)
  console.log("")

  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    console.error("❌ Error: PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET are required")
    process.exit(1)
  }

  try {
    // Step 1: Get access token
    console.log("1️⃣ Getting access token...")
    const authResponse = await fetch(`${PESAPAL_API_URL}/api/Auth/RequestToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET,
      }),
    })

    const authData = await authResponse.json()

    if (authData.error || authData.status !== "200") {
      console.error("❌ Authentication failed:", authData.error?.message || authData)
      process.exit(1)
    }

    const token = authData.token
    console.log("   ✅ Token obtained")

    // Step 2: Check existing IPNs
    console.log("\n2️⃣ Checking existing IPNs...")
    const listResponse = await fetch(`${PESAPAL_API_URL}/api/URLSetup/GetIpnList`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })

    const existingIPNs = await listResponse.json()
    console.log(`   Found ${Array.isArray(existingIPNs) ? existingIPNs.length : 0} existing IPN(s)`)

    // Check if our IPN URL is already registered
    if (Array.isArray(existingIPNs)) {
      const existing = existingIPNs.find((ipn: any) => ipn.url === IPN_URL)
      if (existing) {
        console.log("\n✅ IPN already registered!")
        console.log(`   IPN ID: ${existing.ipn_id}`)
        console.log(`   URL: ${existing.url}`)
        console.log("\n📝 Add this to your .env file:")
        console.log(`   PESAPAL_IPN_ID=${existing.ipn_id}`)
        return
      }
    }

    // Step 3: Register new IPN
    console.log("\n3️⃣ Registering new IPN...")
    const registerResponse = await fetch(`${PESAPAL_API_URL}/api/URLSetup/RegisterIPN`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        url: IPN_URL,
        ipn_notification_type: "POST",
      }),
    })

    const registerData = await registerResponse.json()

    if (registerData.error || registerData.status !== "200") {
      console.error("❌ IPN registration failed:", registerData.error?.message || registerData)
      process.exit(1)
    }

    console.log("\n✅ IPN registered successfully!")
    console.log(`   IPN ID: ${registerData.ipn_id}`)
    console.log(`   URL: ${registerData.url}`)
    console.log(`   Created: ${registerData.created_date}`)
    console.log("\n📝 Add this to your .env file:")
    console.log(`   PESAPAL_IPN_ID=${registerData.ipn_id}`)

  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }
}

main()
