const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const PUBLIC = path.join(__dirname, "..", "public");
const LOGO = path.join(PUBLIC, "logo.svg");

const sizes = [16, 32, 48, 64, 128, 180, 192, 512];

// Build an ICO file from PNG buffers (PNG-embedded ICO, supported since Vista)
function buildIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4); // count

  const entries = [];
  const bodies = [];
  let offset = 6 + 16 * pngs.length;

  for (const png of pngs) {
    const entry = Buffer.alloc(16);
    const dim = png.size === 256 ? 0 : png.size;
    entry.writeUInt8(dim, 0); // width
    entry.writeUInt8(dim, 1); // height
    entry.writeUInt8(0, 2); // colors
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(png.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    entries.push(entry);
    bodies.push(png.buffer);
    offset += png.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...bodies]);
}

async function main() {
  for (const size of sizes) {
    const out = path.join(PUBLIC, `favicon-${size}x${size}.png`);
    await sharp(LOGO, { density: 300 })
      .resize(size, size, { fit: "contain" })
      .png()
      .toFile(out);
    console.log(`✅ ${path.basename(out)}`);
  }

  // Build favicon.ico with PNGs of several sizes embedded
  const pngs = [];
  for (const size of [16, 32, 48, 64]) {
    const buf = await sharp(LOGO, { density: 300 })
      .resize(size, size, { fit: "contain" })
      .png()
      .toBuffer();
    pngs.push({ size, buffer: buf });
  }

  const ico = buildIco(pngs);
  fs.writeFileSync(path.join(PUBLIC, "favicon.ico"), ico);
  console.log(`✅ favicon.ico (${ico.length} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
