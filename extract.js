require('dotenv').config();
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { transcribeVideo } = require('./transcribe');

function detectSource(input) {
  if (!input.startsWith('http')) return 'text';
  if (input.includes('youtube.com') || input.includes('youtu.be')) return 'youtube';
  if (input.includes('tiktok.com')) return 'tiktok';
  if (input.includes('twitter.com') || input.includes('x.com')) return 'twitter';
  if (input.includes('instagram.com')) return 'instagram';
  if (input.match(/\.(mp3|mp4|wav|m4a)$/)) return 'audio';
  return 'website';
}

async function extractFromWebsite(url) {
  console.log('🌐 Scraping website...');
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove scripts, styles, nav, footer
    $('script, style, nav, footer, header, aside, .sidebar, .menu, .ad').remove();

    // Try to find main content
    let text = '';
    const selectors = ['article', 'main', '.post-content', '.entry-content', '.article-body', '[role="main"]'];
    
    for (const selector of selectors) {
      if ($(selector).length) {
        text = $(selector).text();
        break;
      }
    }

    // Fallback to body
    if (!text) {
      text = $('body').text();
    }

    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();

    if (text.length < 100) {
      throw new Error('Could not extract enough text from this page');
    }

    console.log(`✅ Extracted ${text.length} characters from website`);
    return text;
  } catch (err) {
    throw new Error(`Website scraping failed: ${err.message}`);
  }
}

async function extractFromTwitter(url) {
  console.log('🐦 Extracting from Twitter/X...');
  // Twitter blocks scraping, so we use a workaround
  try {
    const nitterUrl = url
      .replace('twitter.com', 'nitter.net')
      .replace('x.com', 'nitter.net');
    
    const res = await fetch(nitterUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    let tweets = [];
    $('.tweet-content').each((i, el) => {
      tweets.push($(el).text().trim());
    });

    if (tweets.length === 0) {
      throw new Error('Could not extract tweets. Try copying the text manually.');
    }

    const text = tweets.join('\n\n');
    console.log(`✅ Extracted ${tweets.length} tweets`);
    return text;
  } catch (err) {
    throw new Error(`Twitter extraction failed: ${err.message}. Try copying the tweet text and pasting it directly.`);
  }
}

async function extractFromTikTok(url) {
  console.log('🎵 Extracting from TikTok...');
  // TikTok videos have audio — download and transcribe like YouTube
  try {
    return await transcribeVideo(url);
  } catch (err) {
    throw new Error(`TikTok extraction failed: ${err.message}. Try with the direct video URL.`);
  }
}

async function extractFromInstagram(url) {
  console.log('📸 Extracting from Instagram...');
  // Instagram blocks scraping heavily
  throw new Error('Instagram blocks automated access. Please copy the caption or reel transcript and paste it directly.');
}

async function extractContent(input) {
  const source = detectSource(input);
  console.log(`📎 Source detected: ${source}`);

  switch (source) {
    case 'youtube':
      return await transcribeVideo(input);
    case 'website':
      return await extractFromWebsite(input);
    case 'twitter':
      return await extractFromTwitter(input);
    case 'tiktok':
      return await extractFromTikTok(input);
    case 'instagram':
      return await extractFromInstagram(input);
    case 'audio':
      return await transcribeVideo(input);
    case 'text':
      console.log(`📝 Using direct text input (${input.length} characters)`);
      return input;
    default:
      return input;
  }
}

module.exports = { extractContent, detectSource };