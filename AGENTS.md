<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build   # Production build
npm run lint    # ESLint check
```

No test script configured.

## Environment

Create `.env.local` from `.env.example`:

```bash
VOLCENGINE_ARK_API_KEY=ark-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VOLCENGINE_IMAGE_MODEL=doubao-seedream-4-5-251128
VOLCENGINE_LLM_MODEL=doubao-pro-32k-241215
```

Get API key from: https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey

## Architecture

```
app/
├── page.tsx                 # / — 书架 (Bookshelf)
├── create/page.tsx          # /create — 创作流程
├── read/[id]/page.tsx       # /read/[id] — 翻页阅读器
└── api/
    ├── generate-story/route.ts  # AI 扩写故事
    └── generate-image/route.ts  # AI 生成插画 (服务端下载 → base64)

lib/
├── volcengine-ark.ts    # 火山方舟 SDK
├── db.ts               # IndexedDB 封装 (idb)
├── story-generator.ts # 故事生成逻辑
└── image-generator.ts # 图片生成逻辑
```

## Key Constraints

- **Data**: All books stored in browser IndexedDB (not server). Clear browser = lose data.
- **Images**: Downloaded immediately to IndexedDB on generation (avoids 24h expiry issue).
- **Images config**: `next.config.ts` sets `images.unoptimized: true` required for local Blobs.
- **AI**: All AI calls go through server-side API routes (client ↔ server ↔ Volcengine Ark).
- **Framework**: Next.js 16 App Router, React 19, Tailwind CSS 4.

## Volcengine Ark Integration

AI APIs are in `lib/volcengine-ark.ts`. Two models required:
- LLM for story expansion (`generate-story` route)
- Seedream model for image generation (`generate-image` route)

Both called via server-side API routes to hide API key.

## Non-obvious Details

- `app/api/generate-image/route.ts` downloads image to server, converts to base64, returns to client → required because image URLs from Seedream expire in 24h.
- Tailwind CSS 4 uses `@tailwindcss/postcss` + config in `postcss.config.mjs` (no `tailwind.config.ts`).
- ESLint 9 uses flat config in `eslint.config.mjs`.