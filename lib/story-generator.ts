import { Character, GeneratedStory } from '@/types';

export async function generateStory(
  characters: Character[],
  plot: string
): Promise<GeneratedStory> {
  const characterDescriptions = characters
    .map((c) => `- ${c.name}：${c.appearance}`)
    .join('\n');

  const prompt = `你是一个专业的儿童绘本作家。请根据以下角色和情节概要，创作一个适合 5-10 岁儿童的完整绘本故事。

角色：
${characterDescriptions}

情节概要：${plot}

要求：
1. 故事分为 8-12 页
2. 每页包含一段细腻、适合朗读的故事文字（100-200 字）
3. 每页附带一个详细的画面描述提示词（用于 AI 绘画），该提示词必须包含所有角色的外貌特征
4. 故事要有开头、发展、高潮、结尾，语言温暖优美
5. 输出严格的 JSON 格式

输出格式：
{
  "title": "绘本标题",
  "pages": [
    {
      "pageNumber": 1,
      "storyText": "故事段落...",
      "imagePrompt": "画面描述..."
    }
  ]
}`;

  const response = await fetch('/api/generate-story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`故事生成失败: ${err}`);
  }

  const data = await response.json();
  console.log("[StoryGen] Raw response:", JSON.stringify(data).slice(0, 500));

  if (data.error) {
    throw new Error(data.error);
  }

  if (!data.title || !Array.isArray(data.pages)) {
    console.error("[StoryGen] Invalid response structure:", data);
    throw new Error("故事生成结果格式异常");
  }

  return data as GeneratedStory;
}
