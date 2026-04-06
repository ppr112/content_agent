const { createCanvas, registerFont, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Register custom fonts
registerFont(path.join(__dirname, 'fonts', 'BebasNeue-Regular.ttf'), { family: 'Bebas Neue' });
registerFont(path.join(__dirname, 'fonts', 'UnifrakturMaguntia-Book.ttf'), { family: 'Celandine' });

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;

function wrapText(ctx, text, maxWidth) {
  if (!text) return [];
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

async function fetchBackground(query) {
  if (!UNSPLASH_KEY) return null;
  try {
    const searchQuery = query || 'dark moody abstract';
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&orientation=squarish&per_page=5&client_id=${UNSPLASH_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const pick = data.results[Math.floor(Math.random() * data.results.length)];
      const imgRes = await fetch(pick.urls.regular);
      const buffer = await imgRes.buffer();
      return await loadImage(buffer);
    }
  } catch (err) {
    console.log('⚠️  Background fetch failed, using solid dark');
  }
  return null;
}

async function loadCustomBackground(filePath) {
  try {
    return await loadImage(filePath);
  } catch (err) {
    console.log('⚠️  Custom background failed to load');
    return null;
  }
}

// LAYOUT 1: Image top, gradient fade, text bottom
function layoutTopImage(ctx, bgImage, piece, width, height) {
  // Draw background image in top portion
  if (bgImage) {
    const scale = Math.max(width / bgImage.width, height / bgImage.height);
    const sw = bgImage.width * scale;
    const sh = bgImage.height * scale;
    ctx.drawImage(bgImage, (width - sw) / 2, (height - sh) / 2, sw, sh);
  }

  // Gradient overlay - top visible, bottom dark
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(0,0,0,0.3)');
  gradient.addColorStop(0.35, 'rgba(0,0,0,0.5)');
  gradient.addColorStop(0.55, 'rgba(0,0,0,0.85)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.95)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Theme label
  const themeLabel = (piece.theme_label || 'WISDOM').toUpperCase();
  ctx.fillStyle = '#c8a84e';
  ctx.fillRect(70, height * 0.48, 50, 2);
  ctx.font = '18px "Bebas Neue"';
  ctx.fillText(themeLabel, 130, height * 0.48 + 6);

  // Setup text
  ctx.fillStyle = '#ffffff';
  ctx.font = '58px "Bebas Neue"';
  const setupText = '"' + (piece.setup || piece.quote || '').toUpperCase();
  const setupLines = wrapText(ctx, setupText, width - 180);
  let y = height * 0.55;
  for (const line of setupLines) {
    ctx.fillText(line, 70, y);
    y += 68;
  }

  // Punchline
  ctx.fillStyle = '#c8a84e';
  ctx.font = '58px "Bebas Neue"';
  const punchText = (piece.punchline || '').toUpperCase() + '"';
  const punchLines = wrapText(ctx, punchText, width - 180);
  for (const line of punchLines) {
    ctx.fillText(line, 70, y);
    y += 68;
  }

  // Speaker
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px "Bebas Neue"';
  ctx.fillText((piece.speaker || 'Unknown').toUpperCase(), 70, y + 30);
  if (piece.speaker_title) {
    ctx.fillStyle = '#c8a84e';
    ctx.font = '16px "Bebas Neue"';
    ctx.fillText(piece.speaker_title, 70, y + 56);
  }
}

// LAYOUT 2: Full image with dark overlay, text centered
function layoutFullOverlay(ctx, bgImage, piece, width, height) {
  if (bgImage) {
    const scale = Math.max(width / bgImage.width, height / bgImage.height);
    const sw = bgImage.width * scale;
    const sh = bgImage.height * scale;
    ctx.drawImage(bgImage, (width - sw) / 2, (height - sh) / 2, sw, sh);
  }

  // Heavy dark overlay
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, width, height);

  // Theme label centered
  const themeLabel = (piece.theme_label || 'WISDOM').toUpperCase();
  ctx.fillStyle = '#c8a84e';
  ctx.font = '18px "Bebas Neue"';
  const labelWidth = ctx.measureText(themeLabel).width;
  ctx.fillRect((width - labelWidth) / 2 - 30, height * 0.32, 50, 2);
  ctx.fillText(themeLabel, (width - labelWidth) / 2 + 30, height * 0.32 + 6);

  // Setup text centered
  ctx.fillStyle = '#ffffff';
  ctx.font = '58px "Bebas Neue"';
  ctx.textAlign = 'center';
  const setupText = '"' + (piece.setup || piece.quote || '').toUpperCase();
  const setupLines = wrapText(ctx, setupText, width - 200);
  let y = height * 0.40;
  for (const line of setupLines) {
    ctx.fillText(line, width / 2, y);
    y += 68;
  }

  // Punchline centered
  ctx.fillStyle = '#c8a84e';
  ctx.font = '58px "Bebas Neue"';
  const punchText = (piece.punchline || '').toUpperCase() + '"';
  const punchLines = wrapText(ctx, punchText, width - 200);
  for (const line of punchLines) {
    ctx.fillText(line, width / 2, y);
    y += 68;
  }

  // Speaker centered
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px "Bebas Neue"';
  ctx.fillText((piece.speaker || 'Unknown').toUpperCase(), width / 2, y + 40);
  if (piece.speaker_title) {
    ctx.fillStyle = '#c8a84e';
    ctx.font = '16px "Bebas Neue"';
    ctx.fillText(piece.speaker_title, width / 2, y + 66);
  }

  ctx.textAlign = 'left';
}

// LAYOUT 3: Image right side, text left on dark
function layoutSplitRight(ctx, bgImage, piece, width, height) {
  // Dark base
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  // Image on right half with fade
  if (bgImage) {
    const imgWidth = width * 0.55;
    const scale = Math.max(imgWidth / bgImage.width, height / bgImage.height);
    const sw = bgImage.width * scale;
    const sh = bgImage.height * scale;
    ctx.save();
    ctx.beginPath();
    ctx.rect(width - imgWidth, 0, imgWidth, height);
    ctx.clip();
    ctx.drawImage(bgImage, width - imgWidth + (imgWidth - sw) / 2, (height - sh) / 2, sw, sh);
    ctx.restore();

    // Fade from left
    const gradient = ctx.createLinearGradient(width * 0.4, 0, width * 0.65, 0);
    gradient.addColorStop(0, 'rgba(10,10,10,1)');
    gradient.addColorStop(1, 'rgba(10,10,10,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(width * 0.4, 0, width * 0.3, height);
  }

  // Theme label
  const themeLabel = (piece.theme_label || 'WISDOM').toUpperCase();
  ctx.fillStyle = '#c8a84e';
  ctx.fillRect(70, height * 0.35, 50, 2);
  ctx.font = '18px "Bebas Neue"';
  ctx.fillText(themeLabel, 130, height * 0.35 + 6);

  // Setup text - left side only
  ctx.fillStyle = '#ffffff';
  ctx.font = '52px "Bebas Neue"';
  const setupText = '"' + (piece.setup || piece.quote || '').toUpperCase();
  const setupLines = wrapText(ctx, setupText, width * 0.52);
  let y = height * 0.42;
  for (const line of setupLines) {
    ctx.fillText(line, 70, y);
    y += 62;
  }

  // Punchline
  ctx.fillStyle = '#c8a84e';
  ctx.font = '52px "Bebas Neue"';
  const punchText = (piece.punchline || '').toUpperCase() + '"';
  const punchLines = wrapText(ctx, punchText, width * 0.52);
  for (const line of punchLines) {
    ctx.fillText(line, 70, y);
    y += 62;
  }

  // Speaker
  ctx.fillStyle = '#ffffff';
  ctx.font = '22px "Bebas Neue"';
  ctx.fillText((piece.speaker || 'Unknown').toUpperCase(), 70, y + 30);
  if (piece.speaker_title) {
    ctx.fillStyle = '#c8a84e';
    ctx.font = '14px "Bebas Neue"';
    ctx.fillText(piece.speaker_title, 70, y + 52);
  }
}

// LAYOUT 4: Clean dark with no background (original style)
function layoutCleanDark(ctx, bgImage, piece, width, height) {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  // Subtle border
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // Theme label
  const themeLabel = (piece.theme_label || 'WISDOM').toUpperCase();
  ctx.fillStyle = '#c8a84e';
  ctx.fillRect(70, height * 0.38, 50, 2);
  ctx.font = '18px "Bebas Neue"';
  ctx.fillText(themeLabel, 130, height * 0.38 + 6);

  // Setup text
  ctx.fillStyle = '#ffffff';
  ctx.font = '58px "Bebas Neue"';
  const setupText = '"' + (piece.setup || piece.quote || '').toUpperCase();
  const setupLines = wrapText(ctx, setupText, width - 180);
  let y = height * 0.44;
  for (const line of setupLines) {
    ctx.fillText(line, 70, y);
    y += 68;
  }

  // Punchline
  ctx.fillStyle = '#c8a84e';
  ctx.font = '58px "Bebas Neue"';
  const punchText = (piece.punchline || '').toUpperCase() + '"';
  const punchLines = wrapText(ctx, punchText, width - 180);
  for (const line of punchLines) {
    ctx.fillText(line, 70, y);
    y += 68;
  }

  // Speaker
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px "Bebas Neue"';
  ctx.fillText((piece.speaker || 'Unknown').toUpperCase(), 70, y + 30);
  if (piece.speaker_title) {
    ctx.fillStyle = '#c8a84e';
    ctx.font = '16px "Bebas Neue"';
    ctx.fillText(piece.speaker_title, 70, y + 56);
  }
}

const LAYOUTS = [layoutTopImage, layoutFullOverlay, layoutSplitRight, layoutCleanDark];

async function generateImage(piece, index, outputDir, customBg) {
  const width = 1080;
  const height = 1080;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Pick a random layout
  const layout = LAYOUTS[index % LAYOUTS.length];

  // Get background image
 let bgImage = null;
  if (customBg && fs.statSync(customBg).isDirectory()) {
    // Pick random image from folder
    const files = fs.readdirSync(customBg).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    if (files.length > 0) {
      const pick = files[Math.floor(Math.random() * files.length)];
      bgImage = await loadCustomBackground(path.join(customBg, pick));
    }
  } else if (customBg) {
    bgImage = await loadCustomBackground(customBg);
  } else {
    bgImage = await fetchBackground(piece.visual_mood);
  }

  // Apply layout
  layout(ctx, bgImage, piece, width, height);

  // Brand watermark
  ctx.fillStyle = 'rgba(60,60,60,0.8)';
  ctx.font = '32px "Celandine"';
  ctx.textAlign = 'center';
  const brandText = "— in'ThepursuiTof —";
  ctx.fillText(brandText, width / 2, height - 50);
  ctx.textAlign = 'left';

  // Save
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = `post_${index + 1}_${(piece.quote_type || 'wisdom').replace(' ', '_')}.png`;
  const filePath = path.join(outputDir, fileName);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filePath, buffer);

  console.log(`🖼️  Created: ${fileName} [${layout.name}]`);
  return filePath;
}

async function generateAllImages(pieces, outputDir = './images', customBg = null) {
  console.log('🎨 Generating Instagram images...');

  if (fs.existsSync(outputDir)) {
    const oldFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.png'));
    oldFiles.forEach(f => fs.unlinkSync(path.join(outputDir, f)));
  }

  const paths = [];
  for (let i = 0; i < pieces.length; i++) {
    const p = await generateImage(pieces[i], i, outputDir, customBg);
    paths.push(p);
  }

  console.log(`✅ Created ${paths.length} images in ${outputDir}/`);
  return paths;
}

module.exports = { generateAllImages };