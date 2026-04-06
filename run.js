const { runPipeline } = require('./pipeline');

const videoUrl = process.argv[2];
const customBg = process.argv[3] || null;

if (!videoUrl) {
  console.log('Usage: node run.js "youtube-url" [optional-background-image-path]');
  process.exit(1);
}

runPipeline(videoUrl, {
  clientName: "in'ThepursuiTof",
  brandVoice: 'Philosophical, stoic, reflective. Speaks in quiet truths. Audience is young people pursuing self-mastery.',
  neverSay: 'grind, hustle, boss, guru, game-changer, unlock, level up, slay, king, queen',
  customBg: customBg,
});