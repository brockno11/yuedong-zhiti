// ===== 跃动智体 — DeepSeek API 接口预留 =====
// 当配置 DEEPSEEK_API_KEY 环境变量后，可切换为真实 AI 调用

const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";
const MODEL = "deepseek-chat"; // 或 "deepseek-reasoner" 用于深度推理

interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DeepSeekResponse {
  id: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
}

export async function callDeepSeek(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error(
      "未配置 DEEPSEEK_API_KEY 环境变量。请设置后重试，或使用 mock AI 模式。"
    );
  }

  const messages: DeepSeekMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API 调用失败: ${response.status} ${error}`);
  }

  const data: DeepSeekResponse = await response.json();
  return data.choices[0]?.message?.content || "";
}

export function isDeepSeekConfigured(): boolean {
  return !!process.env.DEEPSEEK_API_KEY;
}
