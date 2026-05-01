# 🏠 StoryBook AI

> Create unique illustrated storybooks for children (ages 5-10) with the power of AI

Turn a simple character idea and plot summary into a beautiful 8-12 page illustrated storybook that reads like a real book—all powered by AI. Characters stay consistent across pages, stories are automatically expanded, and illustrations are generated to match each scene.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-black?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-black?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-black?logo=tailwindcss)
[![MIT License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## ✨ Features

- **AI Story Creation** — Enter character names, appearances, and a plot summary. AI expands it into a complete 8-12 page story
- **AI Illustration Generation** — Each page gets matching artwork. Characters maintain consistent appearances across all pages
- **3D Flip-Book Reader** — Immersive page-turning experience with click, keyboard, and gesture support
- **Personal Bookshelf** — All your created books stored locally, displayed as a grid of covers
- **Regenerate Illustrations** — Re-generate artwork while keeping the story intact
- **Export as ZIP** — Download your book with all images and text

---

## 🚀 Quick Start

### 1. Clone the project

```bash
git clone https://github.com/twmissingu/story-book.git
cd story-book
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and add your API key:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
# Volcengine Ark API Key
# Get yours: https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey
VOLCENGINE_ARK_API_KEY=ark-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Image generation model (Seedream 4.5)
VOLCENGINE_IMAGE_MODEL=doubao-seedream-4-5-251128

# LLM model for story expansion (replace with your actual model ID)
VOLCENGINE_LLM_MODEL=doubao-pro-32k-241215
```

### 4. Start the dev server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 📖 How It Works

1. Click **"✨ Create New Book"**
2. **Step 1** — Add characters (name + appearance), 1-5 characters
3. **Step 2** — Write a brief plot summary (5+ characters)
4. **Step 3** — Click "Start Creating", wait for AI (1-3 minutes)
5. Flip through your completed book
6. Export as ZIP or click "Regenerate Illustrations" to fix images

---

## 🏗️ Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Next.js 16 + App Router | Server/Client components |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS 4 | Atomic CSS |
| AI Images | Volcengine Seedream 4.5 | Text-to-image, 4:3 aspect |
| AI Stories | Volcengine Ark LLM | Chinese story expansion |
| Storage | IndexedDB (`idb`) | Blob + JSON in browser |
| Export | JSZip + FileSaver | ZIP download |

---

## 📁 Project Structure

```
story-book/
├── app/
│   ├── page.tsx                    # Bookshelf /
│   ├── create/page.tsx             # Creation flow
│   ├── read/[id]/page.tsx         # Flip-book reader
│   ├── api/
│   │   ├── generate-story/route.ts # AI story expansion
│   │   └── generate-image/route.ts # AI images (server download → base64)
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── components/
│   ├── bookshelf/                  # Bookshelf components
│   ├── create/                     # Creation flow components
│   └── reader/                     # Reader components
├── lib/
│   ├── volcengine-ark.ts           # Volcengine Ark SDK
│   ├── db.ts                       # IndexedDB wrapper
│   ├── story-generator.ts         # Story generation logic
│   └── image-generator.ts          # Image generation logic
├── public/                         # Static assets
├── .env.example                    # Environment template
├── next.config.ts
└── package.json
```

---

## ⚠️ Important Notes

1. **API Key Security** — `.env.local` contains sensitive keys, **do NOT commit to Git**
2. **Image Expiry** — App downloads images to IndexedDB immediately, no 24h expiry worries
3. **Data is Local** — All books stored in browser IndexedDB, clearing browser = losing data
4. **Network Required** — AI generation needs access to Volcengine API
5. **Recommended Browser** — Chrome/Edge for best IndexedDB support

---

## 🔧 Troubleshooting

### Illustration shows "Image Generation Failed"
- Check API key in `.env.local`
- Check your Volcengine account has available quota
- Click **"Regenerate Illustrations"** to retry

### Generation stuck
- Open browser DevTools → Console for errors
- Check network connection stability
- Verify your LLM model ID has permission

### Clear data and start fresh
- DevTools → Application → IndexedDB → StoryBookDB → Delete all

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

Contributions welcome! Open an issue or submit a PR.

---

## 🤖 For AI Agents

This section enables AI agents to automatically set up the project.

### Setup (for AI agents)

```bash
# 1. Clone and install
git clone https://github.com/[your-username]/story-book.git
cd story-book
npm install

# 2. Copy environment template
cp .env.example .env.local
```

### Interactive API Key Setup

The AI agent should prompt the user for their Volcengine Ark API key:

1. Ask user to get API key from: https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey
2. Write the key to `.env.local`:
   ```
   VOLCENGINE_ARK_API_KEY=<user-provided-key>
   ```

Model IDs in `.env.local` should work by default, but may need adjustment based on user's permissions.

### Verify Setup

```bash
npm run dev
# Visit http://localhost:3000 — should load without errors
```