const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SVG_PATH = path.join(__dirname, '..', 'public', 'icon.svg');
const OUT_DIR = path.join(__dirname, '..', 'public');
const IOS_ASSETS = path.join(__dirname, '..', 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');

const SIZES = [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 192, 512, 1024];

async function generate() {
  const svg = fs.readFileSync(SVG_PATH);

  for (const size of SIZES) {
    const outPath = path.join(OUT_DIR, `icon-${size}.png`);
    await sharp(svg).resize(size, size).png().toFile(outPath);
    console.log(`Generated icon-${size}.png`);
  }

  // apple-touch-icon
  fs.copyFileSync(path.join(OUT_DIR, 'icon-180.png'), path.join(OUT_DIR, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // Copy 1024x1024 to Xcode asset catalog
  if (fs.existsSync(IOS_ASSETS)) {
    fs.copyFileSync(
      path.join(OUT_DIR, 'icon-1024.png'),
      path.join(IOS_ASSETS, 'AppIcon-512@2x.png')
    );
    console.log('Copied 1024x1024 to Xcode AppIcon asset catalog');
  }

  console.log('Done!');
}

generate().catch(console.error);
