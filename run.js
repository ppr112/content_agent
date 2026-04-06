const { runPipeline } = require('./pipeline');

const videoUrl = process.argv[2];

if (!videoUrl) {
  console.log('Usage: node run.js "youtube-url"');
  process.exit(1);
}

runPipeline(videoUrl, {
  clientName: "in'ThepursuiTof",
  brandVoice: 'Philosophical, stoic, reflective. Speaks in quiet truths. Audience is young people pursuing self-mastery. The tone is a late-night conversation with your deepest self.',
  neverSay: 'grind, hustle, boss, guru, game-changer, unlock, level up, slay, king, queen',
});