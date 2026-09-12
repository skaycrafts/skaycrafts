/* ============================================================
   make-seamless.js
   ------------------------------------------------------------
   Turns any texture into a tile that repeats with NO visible seam.

     node tools/make-seamless.js

   Reads   assets/paper-source.png
   Writes  assets/paper-tile.png

   HOW IT WORKS
   A photograph never tiles cleanly: its left edge does not match
   its right, so `background-repeat` shows a hard line at every
   join. Mirroring fixes that geometrically. The output is a 2x2
   block —

       original   |  flipped horizontally
       -----------+----------------------
       flipped    |  flipped both
       vertically |

   — so every outer edge of the block is a mirror of the edge it
   will meet when tiled. The seams cancel out exactly, at every
   repeat, in both directions.

   The trade-off is symmetry: mirrored tiling can read as a
   butterfly pattern on imagery with strong directional features.
   On a soft, low-frequency stone texture at low opacity it is
   imperceptible, which is exactly the case here.

   The source is downscaled first (see TARGET_W). The texture sits
   at 50% opacity behind body copy, so fine detail is invisible in
   use and a large file would be dead weight on every page load.

   No dependencies — PNG decode and encode are implemented below,
   so this runs on a bare Node install.
   ============================================================ */

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const SRC = path.join(__dirname, '..', 'assets', 'paper-source.png');
const OUT = path.join(__dirname, '..', 'assets', 'paper-tile.png');
const TARGET_W = 480;          // width of ONE quadrant; tile is 2x this

/* ── Minimal PNG decode (8-bit RGB/RGBA, all filter types) ──── */
function decodePNG(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');

  let p = 8, W = 0, H = 0, depth = 0, colorType = 0;
  const idat = [];

  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.slice(p + 4, p + 8).toString('latin1');
    if (type === 'IHDR') {
      W = buf.readUInt32BE(p + 8);
      H = buf.readUInt32BE(p + 12);
      depth = buf[p + 16];
      colorType = buf[p + 17];
    } else if (type === 'IDAT') {
      idat.push(buf.slice(p + 8, p + 8 + len));
    } else if (type === 'IEND') break;
    p += 12 + len;
  }

  if (depth !== 8) throw new Error('need an 8-bit PNG (got ' + depth + '-bit)');
  const channels = colorType === 2 ? 3 : colorType === 6 ? 4 : 0;
  if (!channels) throw new Error('need RGB or RGBA (colour type 2 or 6)');

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = W * channels;
  const out = Buffer.alloc(stride * H);

  // Undo the per-row filters
  let pos = 0;
  for (let y = 0; y < H; y++) {
    const filter = raw[pos++];
    const row = raw.slice(pos, pos + stride);
    pos += stride;
    const cur = out.slice(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.slice((y - 1) * stride, y * stride) : Buffer.alloc(stride);

    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? cur[i - channels] : 0;
      const b = prev[i];
      const c = i >= channels ? prev[i - channels] : 0;
      let v = row[i];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const pp = a + b - c;
        const pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      }
      cur[i] = v & 0xff;
    }
  }
  return { W, H, channels, px: out };
}

/* ── Box-filter downscale (averaging, so it stays smooth) ───── */
function downscale(img, targetW) {
  const scale = targetW / img.W;
  const W = targetW;
  const H = Math.max(1, Math.round(img.H * scale));
  const ch = img.channels;
  const out = Buffer.alloc(W * H * ch);
  const xr = img.W / W, yr = img.H / H;

  for (let y = 0; y < H; y++) {
    const y0 = Math.floor(y * yr), y1 = Math.min(img.H, Math.ceil((y + 1) * yr));
    for (let x = 0; x < W; x++) {
      const x0 = Math.floor(x * xr), x1 = Math.min(img.W, Math.ceil((x + 1) * xr));
      const acc = [0, 0, 0, 0];
      let n = 0;
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const i = (sy * img.W + sx) * ch;
          for (let c = 0; c < ch; c++) acc[c] += img.px[i + c];
          n++;
        }
      }
      const o = (y * W + x) * ch;
      for (let c = 0; c < ch; c++) out[o + c] = Math.round(acc[c] / n);
    }
  }
  return { W, H, channels: ch, px: out };
}

/* ── Build the 2x2 mirrored block ───────────────────────────── */
function mirrorTile(img) {
  const { W, H, channels: ch, px } = img;
  const TW = W * 2, TH = H * 2;
  const out = Buffer.alloc(TW * TH * ch);

  const put = (dx, dy, sx, sy) => {
    const s = (sy * W + sx) * ch;
    const d = (dy * TW + dx) * ch;
    for (let c = 0; c < ch; c++) out[d + c] = px[s + c];
  };

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      put(x,             y,             x, y);   // top-left  · original
      put(TW - 1 - x,    y,             x, y);   // top-right · flipped X
      put(x,             TH - 1 - y,    x, y);   // bottom-left · flipped Y
      put(TW - 1 - x,    TH - 1 - y,    x, y);   // bottom-right · both
    }
  }
  return { W: TW, H: TH, channels: ch, px: out };
}

/* ── PNG encode ─────────────────────────────────────────────── */
function crc32(buf) {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = t[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, c]);
}
function encodePNG(img) {
  const { W, H, channels: ch, px } = img;
  const stride = W * ch;
  const rows = Buffer.alloc((stride + 1) * H);
  for (let y = 0; y < H; y++) {
    rows[y * (stride + 1)] = 0;
    px.copy(rows, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = ch === 4 ? 6 : 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(rows, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/* ── Run ────────────────────────────────────────────────────── */
if (!fs.existsSync(SRC)) {
  console.error('Missing ' + path.relative(process.cwd(), SRC));
  console.error('Save the texture there as an 8-bit PNG, then run this again.');
  process.exit(1);
}

const src = decodePNG(fs.readFileSync(SRC));
console.log(`source  ${src.W}x${src.H}, ${src.channels} channels`);

const small = src.W > TARGET_W ? downscale(src, TARGET_W) : src;
if (small !== src) console.log(`scaled  ${small.W}x${small.H}`);

const tile = mirrorTile(small);
fs.writeFileSync(OUT, encodePNG(tile));

const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`tile    ${tile.W}x${tile.H} -> ${path.relative(process.cwd(), OUT)} (${kb} KB)`);
console.log('Seamless in both directions. CSS already points at it.');
