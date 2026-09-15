const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal PNG encoder without external dependencies
function createPNG(width, height, getPixel) {
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA (6)
  ihdr[10] = 0; // Compression: Deflate
  ihdr[11] = 0; // Filter: Adaptive
  ihdr[12] = 0; // Interlace: None

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crc = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([length, body, crcBuf]);
}

// CRC32 implementation for PNG chunks
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (c ^ buf[i]);
    for (let j = 0; j < 8; j++) {
      if ((c & 1) !== 0) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Draw cute Cozy Cat face icon
function catIconPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h * 0.54;
  const r = w * 0.38;

  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Left Pointy Cat Ear
  const exL = cx - r * 0.58;
  const eyL = cy - r * 0.72;
  const earLDist = Math.hypot(x - exL, y - eyL);
  if (earLDist < r * 0.42 && y < cy) {
    // Inner pink ear
    const innerL = Math.hypot(x - (exL + r * 0.05), y - (eyL + r * 0.08));
    if (innerL < r * 0.22) {
      return [255, 160, 180, 255]; // Pastel Pink
    }
    return [249, 115, 22, 255]; // Ginger Orange
  }

  // Right Pointy Cat Ear
  const exR = cx + r * 0.58;
  const eyR = cy - r * 0.72;
  const earRDist = Math.hypot(x - exR, y - eyR);
  if (earRDist < r * 0.42 && y < cy) {
    const innerR = Math.hypot(x - (exR - r * 0.05), y - (eyR + r * 0.08));
    if (innerR < r * 0.22) {
      return [255, 160, 180, 255];
    }
    return [249, 115, 22, 255];
  }

  // Head Circle
  if (dist <= r) {
    // Forehead Tabby Stripes
    if (Math.abs(dx) < r * 0.12 && dy < -r * 0.25) {
      return [194, 65, 12, 255]; // Russet stripe
    }
    if (Math.abs(dx - r * 0.28) < r * 0.09 && dy < -r * 0.2) {
      return [194, 65, 12, 255];
    }
    if (Math.abs(dx + r * 0.28) < r * 0.09 && dy < -r * 0.2) {
      return [194, 65, 12, 255];
    }

    // Eyes
    const eyeLX = cx - r * 0.36;
    const eyeRX = cx + r * 0.36;
    const eyeY = cy - r * 0.05;
    const eyeL = Math.hypot(x - eyeLX, y - eyeY);
    const eyeR = Math.hypot(x - eyeRX, y - eyeY);

    if (eyeL <= r * 0.18 || eyeR <= r * 0.18) {
      // White sparkle highlight
      const sparkL = Math.hypot(x - (eyeLX - r * 0.05), y - (eyeY - r * 0.05));
      const sparkR = Math.hypot(x - (eyeRX - r * 0.05), y - (eyeY - r * 0.05));
      if (sparkL <= r * 0.06 || sparkR <= r * 0.06) {
        return [255, 255, 255, 255]; // Sparkle
      }
      return [26, 26, 26, 255]; // Black glossy eye
    }

    // White Muzzle / Cheeks
    const muzzleDist = Math.hypot(dx, dy - r * 0.32);
    if (muzzleDist <= r * 0.44) {
      // Pink nose
      const noseDist = Math.hypot(dx, dy - r * 0.18);
      if (noseDist <= r * 0.1) {
        return [255, 133, 150, 255]; // Cute Pink Nose
      }
      return [255, 250, 245, 255]; // Soft White muzzle
    }

    // Base coat (Warm Ginger / Orange Tabby)
    return [251, 146, 60, 255];
  }

  return [0, 0, 0, 0]; // Transparent background
}

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 48, 128].forEach(size => {
  const pngBuf = createPNG(size, size, catIconPixel);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), pngBuf);
  console.log(`Generated icons/icon${size}.png (${size}x${size})`);
});
