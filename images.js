const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// Register custom fonts
registerFont(path.join(__dirname, 'fonts', 'BebasNeue-Regular.ttf'), { family: 'Bebas Neue' });
registerFont(path.join(__dirname, 'fonts', 'UnifrakturMaguntia-Book.ttf'), { family: 'Celandine' });

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

function generateImage(piece, index, outputDir = './images') {
  const width = 1080;
  const height = 1080;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Dark background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  // Subtle border
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // Theme label with gold line
  const themeLabel = (piece.theme_label || 'WISDOM').toUpperCase();
  ctx.fillStyle = '#c8a84e';
  ctx.fillRect(70, height * 0.42, 50, 2);
  ctx.font = '18px "Bebas Neue"';
  ctx.fillText(themeLabel, 130, height * 0.42 + 6);

  // Setup text (white, Bebas Neue, uppercase)
  ctx.fillStyle = '#ffffff';
  ctx.font = '58px "Bebas Neue"';
  const setupText = '"' + (piece.setup || piece.quote || '').toUpperCase();
  const setupLines = wrapText(ctx, setupText, width - 180);
  let y = height * 0.48;
  for (const line of setupLines) {
    ctx.fillText(line, 70, y);
    y += 68;
  }

  // Punchline text (gold, Bebas Neue, uppercase)
  ctx.fillStyle = '#c8a84e';
  ctx.font = '58px "Bebas Neue"';
  const punchText = (piece.punchline || '').toUpperCase() + '"';
  const punchLines = wrapText(ctx, punchText, width - 180);
  for (const line of punchLines) {
    ctx.fillText(line, 70, y);
    y += 68;
  }

  // Speaker name (Bebas Neue, white)
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px "Bebas Neue"';
  const speaker = (piece.speaker || 'Unknown').toUpperCase();
  ctx.fillText(speaker, 70, y + 30);

  // Speaker title (gold, smaller)
  if (piece.speaker_title) {
    ctx.fillStyle = '#c8a84e';
    ctx.font = '16px "Bebas Neue"';
    ctx.fillText(piece.speaker_title, 70, y + 56);
  }
// Brand watermark (blackletter style)
  ctx.fillStyle = '#3a3a3a';
  ctx.font = '32px "Celandine"';
  const brandText = "— in'ThepursuiTof —";
  const brandWidth = ctx.measureText(brandText).width;
  ctx.fillText(brandText, (width - brandWidth) / 2, height - 50);

  // Save
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = `post_${index + 1}_${(piece.quote_type || 'wisdom').replace(' ', '_')}.png`;
  const filePath = path.join(outputDir, fileName);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filePath, buffer);

  console.log(`🖼️  Created: ${fileName}`);
  return filePath;
}

function generateAllImages(pieces, outputDir = './images') {
  console.log('🎨 Generating Instagram images...');

  // Clear old images first
  if (fs.existsSync(outputDir)) {
    const oldFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.png'));
    oldFiles.forEach(f => fs.unlinkSync(path.join(outputDir, f)));
  }

  const paths = pieces.map((piece, i) => generateImage(piece, i, outputDir));
  console.log(`✅ Created ${paths.length} images in ${outputDir}/`);
  return paths;
}

module.exports = { generateAllImages };