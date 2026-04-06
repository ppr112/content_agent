# Content Repurposing Agent

An AI-powered pipeline that transforms any YouTube video into 10 ready-to-post Instagram content pieces with branded images. Run it from your terminal or your phone via Telegram.

## What It Does
YouTube Link → Transcript → 10 Philosophical Quotes → Google Sheet + Branded Images + Notifications

**One command. One video. A week of content.**

## Features

- **YouTube Support** — Paste any YouTube link, audio is downloaded and transcribed automatically
- **AI Content Engine** — Extracts 10 powerful quotes with setup/punchline splits using Claude API
- **Dual Content Types** — Speaker wisdom (distilled truths) + original brand interpretations
- **Google Sheets Output** — Structured spreadsheet with quotes, captions, hashtags, timestamps
- **Branded Image Generation** — 1080x1080 Instagram-ready images with 4 layout styles
- **Auto Backgrounds** — Fetches mood-matched images from Unsplash API
- **Custom Backgrounds** — Provide your own images or a folder of backgrounds
- **Telegram Bot** — Run the entire pipeline from your phone, receive images directly in chat
- **Email + Telegram Notifications** — Get notified when content is ready via Make.com
- **Unique Folders** — Each run saves to a timestamped folder, nothing gets overwritten

## Tech Stack

- **Node.js** — Pipeline orchestration
- **Claude API (Anthropic)** — Content generation with custom philosophical prompting
- **AssemblyAI** — Video/audio transcription with language detection
- **Google Sheets API** — Structured output delivery
- **Canvas** — Branded image generation with custom fonts
- **Unsplash API** — Automated background image sourcing
- **Telegram Bot API** — Mobile-first pipeline access
- **Make.com** — Email and Telegram notification automation
- **yt-dlp + ffmpeg** — YouTube audio extraction

## Pipeline Flow
YouTube URL
│
▼
[yt-dlp] ─── Downloads audio
│
▼
[AssemblyAI] ─── Transcribes to text
│
▼
[Claude API] ─── Extracts 10 quotes (distilled truths + original thoughts)
│
▼
[Google Sheets] ─── Writes structured data
│
▼
[Canvas + Unsplash] ─── Generates 10 branded images (4 layout styles)
│
▼
[Make.com] ─── Sends email + Telegram notification
│
▼
[Telegram Bot] ─── Delivers images + quotes directly to your phone

## Project Structure
content-agent/
├── bot.js           # Telegram bot - run pipeline from phone
├── transcribe.js    # Module 1: YouTube → transcript
├── generate.js      # Module 2: Transcript → 10 content pieces
├── sheets.js        # Module 3: Content → Google Sheets
├── images.js        # Module 4: Content → branded images (4 layouts)
├── pipeline.js      # Full pipeline orchestration + notifications
├── run.js           # CLI execution with brand configuration
├── fonts/           # Custom typography (Bebas Neue)
└── .env             # API keys (not committed)

## Setup

1. Clone the repo
2. Run `npm install`
3. Create `.env` with your API keys:
ANTHROPIC_API_KEY=your-key
ASSEMBLYAI_API_KEY=your-key
GOOGLE_SHEETS_ID=your-sheet-id
UNSPLASH_ACCESS_KEY=your-key
TELEGRAM_BOT_TOKEN=your-token
MAKE_WEBHOOK_URL=your-webhook-url
4. Add `credentials.json` (Google service account key)
5. Install system dependencies: `brew install yt-dlp ffmpeg`

## Usage

**From terminal:**
```bash
node run.js "https://youtube.com/watch?v=xxxxx"
```

**With custom background:**
```bash
node run.js "https://youtube.com/watch?v=xxxxx" "./backgrounds"
```

**From Telegram:**
Start the bot: node bot.js
Send any YouTube link to your bot

## Built By

Prashanth Reddy — [in'ThepursuiTof](https://instagram.com/inthepursuitof)
EOF