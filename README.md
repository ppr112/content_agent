# Content Repurposing Agent

An AI-powered pipeline that transforms any YouTube video into 10 ready-to-post Instagram content pieces with branded images.

## What It Does
**One command. One video. A week of content.**

## Tech Stack

- **Node.js** — Pipeline orchestration
- **AssemblyAI** — Video/audio transcription
- **Claude API (Anthropic)** — Content generation with custom prompting
- **Google Sheets API** — Structured output delivery
- **Canvas** — Branded image generation

## Pipeline Flow

1. Downloads audio from any YouTube URL
2. Transcribes using AssemblyAI speech-to-text
3. Extracts 10 powerful quotes via Claude API (mix of speaker wisdom + original interpretations)
4. Writes structured data to Google Sheets
5. Generates 10 branded 1080x1080 Instagram images

## Project Structure## Setup

1. Clone the repo
2. Run `npm install`
3. Create `.env` with your API keys:4. Add `credentials.json` (Google service account key)
5. Install system dependencies: `brew install yt-dlp ffmpeg`

## Usage
```bash
node run.js "https://youtube.com/watch?v=xxxxx"
```

## Built By

Prashanth Reddy — [@in'ThepursuiTof](https://instagram.com)
