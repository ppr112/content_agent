require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { transcribeVideo } = require('./transcribe');
const { generateContent } = require('./generate');
const { writeToSheet } = require('./sheets');
const { generateAllImages } = require('./images');
const path = require('path');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

console.log('🤖 Bot is running...');

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `Welcome to in'ThepursuiTof Content Engine 🔥\n\nSend me any YouTube link and I'll generate:\n- 10 philosophical quotes\n- 10 branded Instagram images\n- Google Sheet with all content\n\nJust paste a link.`);
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Ignore commands
  if (!text || text.startsWith('/')) return;

  // Check if it's a YouTube URL
  if (!text.includes('youtube.com') && !text.includes('youtu.be')) {
    bot.sendMessage(chatId, '❌ That doesn\'t look like a YouTube link. Send me a valid YouTube URL.');
    return;
  }

  try {
    bot.sendMessage(chatId, '🚀 Pipeline starting...');

    // Step 1: Transcribe
    bot.sendMessage(chatId, '🎙️ Downloading and transcribing audio...');
    const transcript = await transcribeVideo(text);
    bot.sendMessage(chatId, `✅ Transcribed! ${transcript.length} characters`);

    // Step 2: Generate content
    bot.sendMessage(chatId, '🧠 Generating quotes...');
    const pieces = await generateContent(transcript, {
      brandVoice: 'Philosophical, stoic, reflective. Speaks in quiet truths.',
      neverSay: 'grind, hustle, boss, guru, game-changer, unlock, level up',
    });
    bot.sendMessage(chatId, `✅ Generated ${pieces.length} content pieces`);

    // Step 3: Write to sheets
    await writeToSheet(pieces);
    bot.sendMessage(chatId, `📊 Google Sheet updated`);

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
    bot.sendMessage(chatId, `❌ Something went wrong: ${err.message}\n\nTry a shorter video or try again.`);
  }
});