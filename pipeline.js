require('dotenv').config();
const fetch = require('node-fetch');
const { extractContent } = require('./extract');
const { generateContent } = require('./generate');
const { writeToSheet } = require('./sheets');
const { generateAllImages } = require('./images');

async function notifyComplete(clientName, pieceCount) {
  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: clientName,
        pieces: pieceCount,
        timestamp: new Date().toISOString(),
        message: `${pieceCount} content pieces ready for ${clientName}`
      })
    });
    console.log('📧 Notification sent!');
  } catch (err) {
    console.log('⚠️  Notification failed, content still saved');
  }
}

async function runPipeline(input, options = {}) {
  const {
    clientName = 'My Content',
    brandVoice = null,
    neverSay = null,
  } = options;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 Content Pipeline — ${clientName}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const transcript = await extractContent(input);
  const pieces = await generateContent(transcript, options);
  await writeToSheet(pieces);

  // Create unique folder with date and time
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
  const safeName = clientName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const folderName = `images_${date}_${time}_${safeName}`;

  await generateAllImages(pieces, `./${folderName}`, options.customBg || null);

  // Send notification
  await notifyComplete(clientName, pieces.length);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ DONE — ${pieces.length} pieces for ${clientName}`);
  console.log(`📁 Images saved in: ${folderName}/`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return pieces;
}

if (require.main === module) {
  const input = process.argv[2];
  if (!input) {
    console.log('Usage: node pipeline.js "youtube-url or website-url or text"');
    process.exit(1);
  }
  runPipeline(input).catch(console.error);
}

module.exports = { runPipeline };