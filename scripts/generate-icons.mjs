// scripts/generate-icons.mjs
// Run with: node scripts/generate-icons.mjs
// Requires: npm install sharp --save-dev

import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const OUT_DIR = join(process.cwd(), 'public', 'icons');
mkdirSync(OUT_DIR, { recursive: true });

// DMN Solutions icon SVG — Blue-to-Cyan gradient with D letterform
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  <rect x="48" y="48" width="416" height="416" rx="88" fill="rgba(255,255,255,0.08)"/>
  <text
    x="256" y="345"
    font-family="Arial Black, Arial, sans-serif"
    font-weight="900"
    font-size="280"
    fill="white"
    text-anchor="middle"
    dominant-baseline="auto"
  >D</text>
</svg>`;

// Maskable icon has extra padding (safe zone = 80% of icon size)
const MASKABLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#g)"/>
  <text
    x="256" y="330"
    font-family="Arial Black, Arial, sans-serif"
    font-weight="900"
    font-size="220"
    fill="white"
    text-anchor="middle"
    dominant-baseline="auto"
  >D</text>
</svg>`;

async function generate() {
  console.log('Generating PWA icons…');

  for (const size of SIZES) {
    await sharp(Buffer.from(SVG))
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(join(OUT_DIR, `icon-${size}x${size}.png`));
    console.log(`  ✅ icon-${size}x${size}.png`);
  }

  // Maskable icons (192 and 512)
  for (const size of [192, 512]) {
    await sharp(Buffer.from(MASKABLE_SVG))
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(join(OUT_DIR, `icon-maskable-${size}x${size}.png`));
    console.log(`  ✅ icon-maskable-${size}x${size}.png`);
  }

  // favicon sizes
  await sharp(Buffer.from(SVG)).resize(32,32).png().toFile(join(OUT_DIR,'icon-32x32.png'));
  await sharp(Buffer.from(SVG)).resize(16,16).png().toFile(join(OUT_DIR,'icon-16x16.png'));
  console.log('  ✅ icon-32x32.png + icon-16x16.png');

  // OG image (1200x630)
  const OG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"   stop-color="#07070f"/>
        <stop offset="100%" stop-color="#0d0d20"/>
      </linearGradient>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stop-color="#2563eb"/>
        <stop offset="100%" stop-color="#06b6d4"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <rect x="60" y="210" width="120" height="120" rx="24" fill="url(#g)"/>
    <text x="122" y="295" font-family="Arial Black" font-size="88" font-weight="900" fill="white" text-anchor="middle">D</text>
    <text x="220" y="275" font-family="Arial Black" font-size="56" font-weight="900" fill="white">DMN Solutions</text>
    <text x="220" y="330" font-family="Arial" font-size="26" fill="rgba(255,255,255,0.5)">Innovative IT Solutions, Kenya</text>
  </svg>`;
  await sharp(Buffer.from(OG_SVG)).png().toFile(join(process.cwd(),'public','og-image.png'));
  console.log('  ✅ og-image.png');

  console.log('\n🎉 All icons generated in public/icons/');
}

generate().catch(console.error);
