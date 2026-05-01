import { NextRequest, NextResponse } from 'next/server';
import { generateImage, IMAGE_SIZE_2K } from '@/lib/volcengine-ark';

const FETCH_TIMEOUT = 15000; // 15 秒超时

async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: '请求体必须是 JSON 格式' }, { status: 400 });
    }

    const { prompt } = body;
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: '缺少 prompt 参数或类型错误' }, { status: 400 });
    }

    // 限制 prompt 长度（Seedream 中文 ≤ 300 字）
    if (prompt.length > 1000) {
      return NextResponse.json({ error: 'prompt 过长，最多 1000 字符' }, { status: 400 });
    }

    console.log('[API generate-image] Generating with prompt length:', prompt.length);

    const result = await generateImage({
      prompt,
      size: IMAGE_SIZE_2K['4:3'],
      watermark: false,
      responseFormat: 'url',
    });

    const image = result.images[0];
    if (!image || image.error) {
      console.error('[API generate-image] Generation error:', image?.error);
      return NextResponse.json(
        { error: image?.error?.message || '图片生成失败' },
        { status: 500 }
      );
    }

    if (!image.url) {
      return NextResponse.json(
        { error: '图片生成成功但未返回 URL' },
        { status: 500 }
      );
    }

    console.log('[API generate-image] Got URL, downloading...');

    // 服务端下载图片（无 CORS 问题），带超时
    const imgResponse = await fetchWithTimeout(image.url, FETCH_TIMEOUT);
    if (!imgResponse.ok) {
      console.error('[API generate-image] Download failed:', imgResponse.status);
      return NextResponse.json(
        { error: `图片下载失败: ${imgResponse.status}` },
        { status: 500 }
      );
    }

    const blob = await imgResponse.blob();
    console.log('[API generate-image] Downloaded, size:', blob.size, 'type:', blob.type);

    if (blob.size === 0) {
      return NextResponse.json({ error: '图片数据为空' }, { status: 500 });
    }

    // 转为 base64 返回给前端 (Edge Runtime 兼容)
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    const mimeType = blob.type || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({ dataUrl, mimeType, size: blob.size });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json({ error: '图片下载超时' }, { status: 504 });
    }
    const message = err instanceof Error ? err.message : '未知错误';
    console.error('[API generate-image] error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
