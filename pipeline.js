require('dotenv').config();
const { transcribeVideo } = require('./transcribe');
const { generateContent } = require('./generate');
const { writeToSheet } = require('./sheets');
const { generateAllImages } = require('./images');

async function runPipeline(videoUrl, options = {}) {
  const {
    clientName = 'My Content',
    brandVoice = null,
    neverSay = null,
  } = options;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 Content Pipeline — ${clientName}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const transcript = await transcribeVideo(videoUrl);
  const pieces = await generateContent(transcript, options);
  await writeToSheet(pieces);

  // Create folder with date, time and client name
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
  const safeName = clientName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const folderName = `images_${date}_${time}_${safeName}`;
  
  generateAllImages(pieces, `./${folderName}`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ DONE — ${pieces.length} pieces for ${clientName}`);
  console.log(`📁 Images saved in: ${folderName}/`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return pieces;
}

if (require.main === module) {
  const url = process.argv[2];
  if (!url) {
    console.log('Usage: node pipeline.js "youtube-url"');
    process.exit(1);
  }
  runPipeline(url).catch(console.error);
}

module.exports = { runPipeline };