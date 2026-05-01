import { Character } from '@/types';

export async function generateImageForPage(
  imagePrompt: string,
  characters: Character[],
  pageNumber: number
): Promise<Blob> {
  const characterDescriptions = characters
    .map((c) => `- ${c.name}：${c.appearance}`)
    .join('\n');

  const fullPrompt = `绘本插画风格，画面温馨、色彩柔和、细节丰富、适合儿童。\n角色固定外貌：\n${characterDescriptions}\n\n场景描述：${imagePrompt}\n比例 4:3，高质量。`;

  console.log(`[GenImage] Page ${pageNumber} requesting...`);

  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: fullPrompt }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`[GenImage] Page ${pageNumber} API error:`, err);
    throw new Error(`第 ${pageNumber} 页图片生成失败: ${err}`);
  }

  const data = await response.json();

  if (data.error) {
    console.error(`[GenImage] Page ${pageNumber} error:`, data.error);
    throw new Error(`第 ${pageNumber} 页: ${data.error}`);
  }

  const { dataUrl, mimeType } = data;
  if (!dataUrl || typeof dataUrl !== 'string') {
    console.error(`[GenImage] Page ${pageNumber} no dataUrl in response:`, data);
    throw new Error(`第 ${pageNumber} 页未获取到图片数据`);
  }

  console.log(`[GenImage] Page ${pageNumber} got dataUrl, converting to blob...`);

  // 使用 fetch 将 data URL 直接转为 blob（比手动 atob 更可靠高效）
  let blob: Blob;
  try {
    blob = await fetch(dataUrl).then((r) => r.blob());
  } catch (fetchErr) {
    console.error(`[GenImage] Page ${pageNumber} dataUrl fetch failed:`, fetchErr);
    throw new Error(`第 ${pageNumber} 页图片数据转换失败`);
  }

  // 如果 API 返回了更精确的 mimeType 且与 fetch 得到的不同，重新包装
  if (mimeType && blob.type !== mimeType) {
    console.log(`[GenImage] Re-wrapping blob type from ${blob.type} to ${mimeType}`);
    blob = new Blob([blob], { type: mimeType });
  }

  console.log(`[GenImage] Page ${pageNumber} blob ready, size=${blob.size}, type=${blob.type}`);

  if (blob.size === 0) {
    throw new Error(`第 ${pageNumber} 页图片为空`);
  }

  return blob;
}

/**
 * 串行生成图片，每次最多 2 个并发，避免触发速率限制
 */
export async function generateAllImages(
  pages: { pageNumber: number; imagePrompt: string }[],
  characters: Character[],
  onStatusChange?: (status: string) => void
): Promise<Map<number, Blob>> {
  const results = new Map<number, Blob>();

  onStatusChange?.('正在画画…');

  // 分批处理，每批 2 个并发
  const batchSize = 2;
  for (let i = 0; i < pages.length; i += batchSize) {
    const batch = pages.slice(i, i + batchSize);
    onStatusChange?.(`正在画第 ${i + 1} ~ ${Math.min(i + batchSize, pages.length)} 张图…`);

    const batchPromises = batch.map(async (page) => {
      const MAX_RETRIES = 2;
      let attempts = 0;

      while (attempts < MAX_RETRIES) {
        try {
          const blob = await generateImageForPage(page.imagePrompt, characters, page.pageNumber);
          results.set(page.pageNumber, blob);
          return;
        } catch (err) {
          attempts++;
          console.error(`[GenImage] Page ${page.pageNumber} attempt ${attempts} failed:`, err);
          if (attempts >= MAX_RETRIES) {
            results.set(page.pageNumber, await createPlaceholderBlob());
            return;
          }
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
    });

    await Promise.all(batchPromises);

    // 批次间等待，避免过快
    if (i + batchSize < pages.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return results;
}

async function createPlaceholderBlob(errorMessage?: string): Promise<Blob> {
  const text = errorMessage
    ? errorMessage.replace(/[<>&"]/g, (c) =>
        ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]!)
      )
    : '图片生成失败';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
    <rect width="100%" height="100%" fill="#FFF8F0"/>
    <text x="50%" y="50%" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#999">
      ${text}
    </text>
  </svg>`;
  return new Blob([svg], { type: 'image/svg+xml' });
}
