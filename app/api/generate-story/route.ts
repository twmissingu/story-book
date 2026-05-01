import { NextRequest, NextResponse } from 'next/server';

const ARK_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3';

function getApiKey(): string {
  const key = process.env.VOLCENGINE_ARK_API_KEY;
  if (!key) throw new Error('环境变量 VOLCENGINE_ARK_API_KEY 未设置');
  return key;
}

function getLLMModel(): string {
  return process.env.VOLCENGINE_LLM_MODEL || 'doubao-pro-32k-241215';
}

/**
 * 从字符串中提取 JSON 对象
 * 优先尝试完整解析，然后尝试提取 markdown 代码块中的 JSON，
 * 最后尝试提取第一个 {...} 结构
 */
function extractJson(str: string): unknown {
  const trimmed = str.trim();

  // 1. 尝试直接解析完整字符串
  try {
    return JSON.parse(trimmed);
  } catch {
    // 继续尝试其他方式
  }

  // 2. 尝试提取 markdown 代码块中的 JSON
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // 继续尝试
    }
  }

  // 3. 尝试提取第一个 {...} 或 [...] 结构
  const objMatch = trimmed.match(/\{[\s\S]*\}/);
  if (objMatch) {
    return JSON.parse(objMatch[0]);
  }

  const arrMatch = trimmed.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    return JSON.parse(arrMatch[0]);
  }

  throw new Error('无法从文本中提取有效的 JSON');
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

    // 限制 prompt 长度，防止 API 滥用
    if (prompt.length > 5000) {
      return NextResponse.json({ error: 'prompt 过长，最多 5000 字符' }, { status: 400 });
    }

    const response = await fetch(`${ARK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: getLLMModel(),
        messages: [
          {
            role: 'system',
            content:
              '你是专业的儿童绘本作家，擅长创作温暖、细腻、适合 5-10 岁儿童的绘本故事。输出必须是严格的 JSON 格式。',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return NextResponse.json(
        { error: `[HTTP ${response.status}] ${text || response.statusText}` },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (data.error) {
      return NextResponse.json(
        { error: `[${data.error.code}] ${data.error.message}` },
        { status: 500 }
      );
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'AI 返回内容为空' }, { status: 500 });
    }

    // 尝试从内容中提取 JSON
    let story;
    try {
      story = extractJson(content);
    } catch (parseErr: unknown) {
      const parseMsg = parseErr instanceof Error ? parseErr.message : '未知解析错误';
      console.error('[generate-story] JSON parse failed. Raw content:', content);
      return NextResponse.json(
        { error: `AI 返回内容无法解析为 JSON: ${parseMsg}` },
        { status: 500 }
      );
    }

    return NextResponse.json(story);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '未知错误';
    console.error('[generate-story] unexpected error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
