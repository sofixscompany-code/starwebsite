const fs = require('fs');

// Draw a 32x32 bitmap favicon: green circle with gold star and red SCI band
const size = 32;
const px = [];
const white = [255, 255, 255, 255];
const green = [34, 139, 34, 255];
const gold = [255, 215, 0, 255];
const red = [204, 0, 0, 255];

function inCircle(cx, cy, r, x, y) {
  return (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r;
}

function inStar(x, y) {
  // Simplified 5-point star centered at (16, 15)
  const cx = 16, cy = 14;
  const dx = x - cx, dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > 9) return false;
  const angle = Math.atan2(dy, dx) + Math.PI / 2;
  const spikes = 5;
  const outer = 9, inner = 4;
  const mod = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const section = (mod * spikes) / (2 * Math.PI);
  const inAngle = section % 1;
  const radius = outer - (outer - inner) * Math.abs(1 - 2 * inAngle);
  return dist <= radius;
}

for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    let color = white;
    if (!inCircle(16, 16, 15, x, y)) {
      color = [0, 0, 0, 0]; // transparent outside
    } else if (!inCircle(16, 16, 13, x, y)) {
      color = green; // green ring
    } else if (inStar(x, y)) {
      color = gold;
    } else if (y >= 25 && y <= 29 && x >= 10 && x <= 22) {
      color = red; // SCI band
    } else {
      color = green;
    }
    px.push(...color);
  }
}

// Encode as 32-bit BGRA rows (bottom-up), then PNG would be complex — write BMP-style ICO instead
// ICO format: ICONDIR + ICONDIRENTRY + BMP (BITMAPINFOHEADER + XOR data + AND mask)
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // count

const entry = Buffer.alloc(16);
entry.writeUInt8(32, 0); // width
entry.writeUInt8(32, 1); // height
entry.writeUInt8(0, 2); // colors
entry.writeUInt8(0, 3); // reserved
entry.writeUInt16LE(1, 4); // planes
entry.writeUInt16LE(32, 6); // bpp

const xorSize = size * size * 4;
const andRowSize = Math.ceil(size / 8);
const andSize = andRowSize * size;
const dataSize = 40 + xorSize + andSize;
entry.writeUInt32LE(dataSize, 8); // size of data
entry.writeUInt32LE(6 + 16, 12); // offset

// BITMAPINFOHEADER
const bmp = Buffer.alloc(40);
bmp.writeUInt32LE(40, 0); // header size
bmp.writeInt32LE(size, 4); // width
bmp.writeInt32LE(size * 2, 8); // height (double for AND mask)
bmp.writeUInt16LE(1, 12); // planes
bmp.writeUInt16LE(32, 14); // bpp
bmp.writeUInt32LE(0, 16); // compression
bmp.writeUInt32LE(xorSize + andSize, 20); // image size
bmp.writeInt32LE(0, 24); // x ppm
bmp.writeInt32LE(0, 28); // y ppm
bmp.writeUInt32LE(0, 32); // colors used
bmp.writeUInt32LE(0, 36); // important colors

// XOR data: 32bpp BGRA bottom-up
const xor = Buffer.alloc(xorSize);
for (let y = 0; y < size; y++) {
  const srcRow = (size - 1 - y) * size * 4;
  for (let x = 0; x < size; x++) {
    const si = srcRow + x * 4;
    const di = y * size * 4 + x * 4;
    xor[di] = px[si + 2]; // B
    xor[di + 1] = px[si + 1]; // G
    xor[di + 2] = px[si]; // R
    xor[di + 3] = px[si + 3]; // A
  }
}

// AND mask: 1 = transparent, 0 = opaque
const and = Buffer.alloc(andSize);
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const alpha = px[y * size * 4 + x * 4 + 3];
    if (alpha === 0) {
      const byte = Math.floor(x / 8);
      const bit = 7 - (x % 8);
      and[y * andRowSize + byte] |= 1 << bit;
    }
  }
}

const ico = Buffer.concat([header, entry, bmp, xor, and]);
fs.writeFileSync('public/favicon.ico', ico);
console.log('favicon.ico generated:', ico.length, 'bytes');
