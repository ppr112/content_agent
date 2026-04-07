require('dotenv').config();
const http = require('http');

// Health check server for Render
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is running');
}).listen(process.env.PORT || 3000);
const TelegramBot = require('node-telegram-bot-api');
const { extractContent, detectSource } = require('./extract');
const { generateContent } = require('./generate');
const { writeToSheet } = require('./sheets');
const { generateAllImages } = require('./images');
const path = require('path');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

console.log('🤖 Bot is running...');

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `Welcome to in'ThepursuiTof Content Engine 🔥\n\nSend me anything:\n- YouTube link\n- Website/blog URL\n- Twitter/X link\n- TikTok link\n- Or just paste text directly\n\nI'll extract the wisdom and generate branded Instagram posts.`);
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Ignore commands
  if (!text || text.startsWith('/')) return;

  // Need minimum input
  if (text.length < 10) {
    bot.sendMessage(chatId, '❌ Send me a URL or paste some text. Needs to be at least a sentence.');
    return;
  }

  try {
    const source = detectSource(text);
    bot.sendMessage(chatId, `🚀 Pipeline starting...\n📎 Source: ${source}`);

    // Step 1: Extract content
    bot.sendMessage(chatId, '📎 Extracting content...');
    const transcript = await extractContent(text);
    bot.sendMessage(chatId, `✅ Extracted! ${transcript.length} characters`);

    // Step 2: Generate content
    bot.sendMessage(chatId, '🧠 Generating quotes...');
    const pieces = await generateContent(transcript, {
      brandVoice: 'Philosophical, stoic, reflective. Speaks in quiet truths.',
      neverSay: 'grind, hustle, boss, guru, game-changer, unlock, level up',
    });
    bot.sendMessage(chatId, `✅ Generated ${pieces.length} content pieces`);

    // Step 3: Write to sheets
    await writeToSheet(pieces);
    bot.sendMessage(chatId, '📊 Google Sheet updated');

    // Step 4: Generate images
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
    const folderName = `images_${date}_${time}_telegram`;

    bot.sendMessage(chatId, '🎨 Creating images...');
    const imagePaths = await generateAllImages(pieces, `./${folderName}`);

    // Step 5: Send each quote + image
    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];
      const caption = `*${(piece.theme_label || 'WISDOM').toUpperCase()}*\n\n"${piece.setup || ''}\n_${piece.punchline || ''}_"\n\n— ${piece.speaker || 'Unknown'}\n\n${piece.caption || ''}`;

      await bot.sendPhoto(chatId, imagePaths[i], {
        caption: caption,
        parse_mode: 'Markdown'
      });

      // Small delay to avoid Telegram rate limits
      await new Promise(r => setTimeout(r, 1000));
    }

    bot.sendMessage(chatId, `\n✅ Done! ${pieces.length} pieces delivered.\n📊 Check your Google Sheet for the full data.`);

  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, `❌ Something went wrong: ${err.message}\n\nTry a different source or paste the text directly.`);
  }
});