import { Page, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Initialize Prisma client for direct database operations
const prisma = new PrismaClient();

// Test data constants
export const TEST_USERS = {
  client: {
    email: 'e2e-client@test.com',
    password: 'TestPassword123!',
    name: 'E2E Test Client',
    phone: '+254700000001',
  },
  agent: {
    email: 'e2e-agent@test.com',
    password: 'TestPassword123!',
    name: 'E2E Test Agent',
    phone: '+254700000002',
    businessName: 'E2E Safari Tours',
  },
  admin: {
    email: 'admin@safariplus.com', // Use existing admin
    password: 'AdminPassword123!',
  },
};

export const TEST_PHONE_MPESA = '0791070041';

// Helper to wait for page to be fully loaded
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
}

// Helper to login a user
export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await waitForPageLoad(page);

  // Fill login form
  await page.fill('input[name="email"], input[type="email"]', email);
  await page.fill('input[name="password"], input[type="password"]', password);

  // Wait a bit for bot protection timing
  await page.waitForTimeout(2500);

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for navigation
  await page.waitForURL(/\/(dashboard|agent|admin)/, { timeout: 15000 });
}

// Helper to logout
export async function logoutUser(page: Page) {
  // Click user menu and sign out
  await page.click('[data-testid="user-menu"], button:has-text("Sign Out"), [aria-label="User menu"]');
  await page.click('text=Sign Out, text=Logout, text=Sign out');
  await page.waitForURL('/');
}

// Helper to create a test user directly in database
export async function createTestUser(userData: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'CLIENT' | 'AGENT' | 'ADMIN';
  emailVerified?: boolean;
}) {
  const hashedPassword = await bcrypt.hash(userData.password, 12);

  // Delete existing user if present
  await prisma.user.deleteMany({
    where: { email: userData.email },
  });

  const user = await prisma.user.create({
    data: {
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      phone: userData.phone,
      role: userData.role || 'CLIENT',
      emailVerified: userData.emailVerified ? new Date() : null,
      status: 'ACTIVE',
    },
  });

  return user;
}

// Helper to create a test agent with user
export async function createTestAgent(agentData: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  businessName: string;
  isVerified?: boolean;
  isApproved?: boolean;
}) {
  const hashedPassword = await bcrypt.hash(agentData.password, 12);

  // Delete existing user/agent if present
  const existingUser = await prisma.user.findUnique({
    where: { email: agentData.email },
    include: { agent: true },
  });

  if (existingUser?.agent) {
    await prisma.agent.delete({ where: { id: existingUser.agent.id } });
  }
  if (existingUser) {
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  const user = await prisma.user.create({
    data: {
      email: agentData.email,
      password: hashedPassword,
      name: agentData.name,
      phone: agentData.phone,
      role: 'AGENT',
      emailVerified: new Date(),
      status: 'ACTIVE',
      agent: {
        create: {
          businessName: agentData.businessName,
          businessEmail: agentData.email,
          businessPhone: agentData.phone,
          isVerified: agentData.isVerified ?? false,
          status: agentData.isApproved ? 'ACTIVE' : 'PENDING',
        },
      },
    },
    include: { agent: true },
  });

  return user;
}

// Helper to get or create a test tour
export async function getOrCreateTestTour(agentId: string) {
  // Check if test tour exists
  let tour = await prisma.tour.findFirst({
    where: {
      agentId,
      slug: { contains: 'e2e-test' },
    },
  });

  if (!tour) {
    tour = await prisma.tour.create({
      data: {
        agentId,
        slug: `e2e-test-safari-${Date.now()}`,
        title: 'E2E Test Safari Adventure',
        subtitle: 'A test tour for E2E testing',
        description: 'This is a comprehensive test tour created for E2E testing purposes. It includes all the features of a real tour including multiple days, accommodations, and activities.',
        highlights: JSON.stringify(['Game drives', 'Wildlife viewing', 'Cultural visits']),
        included: JSON.stringify(['Accommodation', 'Meals', 'Transport', 'Park fees']),
        excluded: JSON.stringify(['International flights', 'Travel insurance', 'Tips']),
        destination: 'Masai Mara',
        country: 'Kenya',
        region: 'Narok',
        durationDays: 3,
        durationNights: 2,
        basePrice: 500,
        currency: 'USD',
        minGroupSize: 1,
        maxGroupSize: 10,
        tourType: JSON.stringify(['SAFARI', 'WILDLIFE']),
        status: 'ACTIVE',
        featured: false,
        depositEnabled: true,
        depositPercentage: 30,
        freeCancellationDays: 14,
        coverImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
          'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
        ]),
      },
    });

    // Create itinerary
    await prisma.itinerary.createMany({
      data: [
        {
          tourId: tour.id,
          dayNumber: 1,
          title: 'Arrival & First Game Drive',
          description: 'Arrive at the camp and enjoy an afternoon game drive.',
          location: 'Masai Mara National Reserve',
          meals: JSON.stringify(['Lunch', 'Dinner']),
          activities: JSON.stringify(['Game drive', 'Welcome drinks']),
          overnight: 'Mara Safari Camp',
        },
        {
          tourId: tour.id,
          dayNumber: 2,
          title: 'Full Day Safari',
          description: 'Full day of game drives with picnic lunch.',
          location: 'Masai Mara National Reserve',
          meals: JSON.stringify(['Breakfast', 'Lunch', 'Dinner']),
          activities: JSON.stringify(['Morning game drive', 'Afternoon game drive']),
          overnight: 'Mara Safari Camp',
        },
        {
          tourId: tour.id,
          dayNumber: 3,
          title: 'Departure',
          description: 'Final morning game drive and departure.',
          location: 'Masai Mara National Reserve',
          meals: JSON.stringify(['Breakfast']),
          activities: JSON.stringify(['Morning game drive']),
        },
      ],
    });
  }

  return tour;
}

// Helper to cleanup test data
export async function cleanupTestData() {
  // Delete test bookings
  await prisma.booking.deleteMany({
    where: {
      contactEmail: { contains: 'e2e' },
    },
  });

  // Delete test tours
  await prisma.tour.deleteMany({
    where: {
      slug: { contains: 'e2e-test' },
    },
  });

  // Delete test users (cascade will handle related records)
  await prisma.user.deleteMany({
    where: {
      email: { contains: 'e2e' },
    },
  });
}

// Helper to verify email for a user (bypassing actual email)
export async function verifyUserEmail(email: string) {
  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });
}

// Helper to approve an agent
export async function approveAgent(userId: string) {
  await prisma.agent.update({
    where: { userId },
    data: { status: 'ACTIVE' },
  });
}

// Helper to get the first active tour from the database
export async function getFirstActiveTour() {
  return prisma.tour.findFirst({
    where: { status: 'ACTIVE' },
    include: { agent: true },
  });
}

// Helper to fill the bot protection fields correctly
export async function fillFormWithBotProtection(page: Page, formFiller: () => Promise<void>) {
  // Wait for page to load
  await waitForPageLoad(page);

  // Wait minimum time for bot protection
  await page.waitForTimeout(2500);

  // Fill the form
  await formFiller();

  // Wait a bit more before submit
  await page.waitForTimeout(500);
}

// Helper to check if element exists
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

// Export prisma for direct database operations in tests
export { prisma };
