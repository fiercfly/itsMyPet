const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const brainDir = '/Users/devsatva/.gemini/antigravity-ide/brain/884f90db-7393-47e8-b21d-fe89163a9907';
const outputDir = '/Users/devsatva/.gemini/antigravity-ide/scratch/pawpal-pet-extension/assets';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const images = [
  { name: 'idle.png', src: 'puppy_idle_cute_1789312479738.jpg' },
  { name: 'drag.png', src: 'puppy_scruff_drag_1789312503496.jpg' },
  { name: 'sleep.png', src: 'puppy_sleep_cute_1789312519673.jpg' },
  { name: 'cry.png', src: 'puppy_cry_sad_1789312541814.jpg' },
  { name: 'tickle.png', src: 'puppy_tickle_laugh_1789312559116.jpg' }
];

async function removeWhiteBackground(srcFile, destFile) {
  const inputPath = path.join(brainDir, srcFile);
  const outputPath = path.join(outputDir, destFile);

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels; // 4

  // Alpha cutout based on brightness / distance from pure white (255, 255, 255)
  // Flood fill / edge detection or smooth color distance
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Distance from white
    const dr = 255 - r;
    const dg = 255 - g;
    const db = 255 - b;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);

    // If extremely close to pure white, make transparent
    if (dist < 18) {
      data[i + 3] = 0;
    } else if (dist < 45) {
      // Smooth alpha feathering
      const alpha = Math.round(((dist - 18) / (45 - 18)) * 255);
      data[i + 3] = Math.min(data[i + 3], alpha);
    }
  }

  // Trim and resize to crisp 256x256
  await sharp(data, {
    raw: {
      width,
      height,
      channels
    }
  })
    .trim({ threshold: 5 })
    .resize(220, 220, { fit: 'inside' })
    .png({ quality: 95 })
    .toFile(outputPath);

  console.log(`Saved transparent sprite: ${destFile}`);
}

async function run() {
  for (const img of images) {
    await removeWhiteBackground(img.src, img.name);
  }
}

run().catch(console.error);
