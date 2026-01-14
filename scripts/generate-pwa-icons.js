const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');
const screenshotsDir = path.join(__dirname, '../public/screenshots');

// Ensure directories exist
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

// Create SVG for the icon
function createIconSvg(size) {
  const fontSize = Math.floor(size * 0.35);
  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F97316;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#EA580C;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
      <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">S+</text>
    </svg>
  `;
}

// Generate all icon sizes
async function generateIcons() {
  console.log('Generating PWA icons...');

  for (const size of sizes) {
    const svg = createIconSvg(size);
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);

    console.log(`Created: icon-${size}x${size}.png`);
  }

  // Create shortcut icons
  const shortcutSvgTours = `
    <svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
      <rect width="96" height="96" rx="19" fill="#F97316"/>
      <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="40" fill="white" text-anchor="middle" dominant-baseline="middle">🗺</text>
    </svg>
  `;

  const shortcutSvgBookings = `
    <svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
      <rect width="96" height="96" rx="19" fill="#F97316"/>
      <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="40" fill="white" text-anchor="middle" dominant-baseline="middle">📅</text>
    </svg>
  `;

  await sharp(Buffer.from(shortcutSvgTours)).png().toFile(path.join(iconsDir, 'shortcut-tours.png'));
  await sharp(Buffer.from(shortcutSvgBookings)).png().toFile(path.join(iconsDir, 'shortcut-bookings.png'));
  console.log('Created shortcut icons');

  // Create placeholder screenshots
  const wideScreenshot = `
    <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
      <rect width="1280" height="720" fill="#FFF7ED"/>
      <rect x="0" y="0" width="1280" height="80" fill="#F97316"/>
      <text x="640" y="50" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">SafariPlus</text>
      <text x="640" y="360" font-family="Arial, sans-serif" font-size="48" fill="#333" text-anchor="middle">Book African Safari Adventures</text>
      <text x="640" y="420" font-family="Arial, sans-serif" font-size="24" fill="#666" text-anchor="middle">Discover unforgettable experiences across East Africa</text>
    </svg>
  `;

  const narrowScreenshot = `
    <svg width="750" height="1334" xmlns="http://www.w3.org/2000/svg">
      <rect width="750" height="1334" fill="#FFF7ED"/>
      <rect x="0" y="0" width="750" height="100" fill="#F97316"/>
      <text x="375" y="60" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="white" text-anchor="middle">SafariPlus</text>
      <text x="375" y="400" font-family="Arial, sans-serif" font-size="36" fill="#333" text-anchor="middle">Book African Safari</text>
      <text x="375" y="450" font-family="Arial, sans-serif" font-size="36" fill="#333" text-anchor="middle">Adventures</text>
      <text x="375" y="520" font-family="Arial, sans-serif" font-size="20" fill="#666" text-anchor="middle">Discover unforgettable experiences</text>
    </svg>
  `;

  await sharp(Buffer.from(wideScreenshot)).png().toFile(path.join(screenshotsDir, 'home-wide.png'));
  await sharp(Buffer.from(narrowScreenshot)).png().toFile(path.join(screenshotsDir, 'home-narrow.png'));
  console.log('Created screenshots');

  console.log('Done! All PWA assets generated.');
}

generateIcons().catch(console.error);
