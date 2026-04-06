require('dotenv').config();
const { AssemblyAI } = require('assemblyai');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY
});

function isYouTubeUrl(url) {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

function downloadYouTubeAudio(url) {
  console.log('📥 Downloading audio from YouTube...');
  const outputPath = path.join(__dirname, 'temp_audio.mp3');
  
  // Remove old file if it exists
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

execSync(`yt-dlp -x --audio-format mp3 --audio-quality 9 --postprocessor-args "ffmpeg:-t 1800 -b:a 32k" -o "${outputPath}" "${url}"`, {
    stdio: 'inherit'
  });

  console.log('✅ Audio downloaded');
  return outputPath;
}

async function transcribeVideo(url) {
  let audioSource = url;

  // If it's a YouTube URL, download the audio first
  if (isYouTubeUrl(url)) {
    const localPath = downloadYouTubeAudio(url);
    console.log('📤 Uploading audio to AssemblyAI...');
    let uploadUrl;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        uploadUrl = await client.files.upload(localPath);
        break;
      } catch (err) {
        console.log(`⚠️  Upload attempt ${attempt} failed. ${attempt < 3 ? 'Retrying in 5s...' : 'Giving up.'}`);
        if (attempt === 3) throw err;
        await new Promise(r => setTimeout(r, 5000));
      }
    }
    console.log('🎙️ Starting transcription...');
    const transcript = await client.transcripts.transcribe({
      audio: uploadUrl,
      speech_models: ['universal-3-pro', 'universal-2'],
      language_detection: true,
    });

    // Clean up temp file
    try { fs.unlinkSync(localPath); } catch(e) {}

    if (transcript.status === 'error') {
      throw new Error(`Transcription failed: ${transcript.error}`);
    }

    console.log(`✅ Transcription complete! ${transcript.text.length} characters`);
    return transcript.text;
  }

  // Otherwise use the direct URL
  console.log('🎙️ Starting transcription...');
  console.log(`   URL: ${url}`);

  const transcript = await client.transcripts.transcribe({
    audio: url,
    speech_models: ['universal-3-pro', 'universal-2'],
    language_detection: true,
  });

  if (transcript.status === 'error') {
    throw new Error(`Transcription failed: ${transcript.error}`);
  }

  console.log(`✅ Transcription complete! ${transcript.text.length} characters`);
  return transcript.text;
}

if (require.main === module) {
  const url = process.argv[2];
  if (!url) {
    console.log('Usage: node transcribe.js "youtube-url-or-audio-url"');
    process.exit(1);
  }
  transcribeVideo(url)
    .then(text => console.log('\n' + text.substring(0, 500) + '...'))
    .catch(console.error);
}

module.exports = { transcribeVideo };