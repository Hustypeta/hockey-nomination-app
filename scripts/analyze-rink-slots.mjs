import sharp from "sharp";

const path = process.argv[2] ?? "public/images/fifa-match-line-rink-template.png";
const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;

function isSlot(r, g, b) {
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum < 45 && r < 60 && g < 60 && b < 70;
}

const grid = new Uint8Array(width * height);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    grid[y * width + x] = isSlot(data[i], data[i + 1], data[i + 2]) ? 1 : 0;
  }
}

function flood(x0, y0) {
  const stack = [[x0, y0]];
  let sumX = 0,
    sumY = 0,
    count = 0,
    minX = x0,
    maxX = x0,
    minY = y0,
    maxY = y0;
  while (stack.length) {
    const [x, y] = stack.pop();
    const idx = y * width + x;
    if (x < 0 || y < 0 || x >= width || y >= height || !grid[idx]) continue;
    grid[idx] = 0;
    count++;
    sumX += x;
    sumY += y;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return { count, cx: sumX / count, cy: sumY / count, w: maxX - minX + 1, h: maxY - minY + 1 };
}

const blobs = [];
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (grid[y * width + x]) {
      const b = flood(x, y);
      if (b.count > 800 && b.w < 120 && b.h < 120) blobs.push(b);
    }
  }
}

blobs.sort((a, b) => a.cy - b.cy || a.cx - b.cx);

for (const b of blobs) {
  const left = (b.cx / width) * 100;
  const top = (b.cy / height) * 100;
  const wPct = (b.w / width) * 100;
  const hPct = (b.h / height) * 100;
  console.log(
    `{ left: ${left.toFixed(1)}, top: ${top.toFixed(1)}, width: ${wPct.toFixed(1)}, height: ${hPct.toFixed(1)} }, // ${Math.round(b.w)}x${Math.round(b.h)}px`
  );
}
