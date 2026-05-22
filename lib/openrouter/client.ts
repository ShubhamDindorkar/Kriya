const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export function getOpenRouterApiKey(): string {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }
  return apiKey;
}

export function getOpenRouterModel(): string {
  return process.env.OPENROUTER_MODEL ?? "anthropic/claude-sonnet-4.5";
}

export async function completeOpenRouterChat(params: {
  system: string;
  user: string;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<string> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getOpenRouterApiKey()}`,
      "Content-Type": "application/json",
      "HTTP-Referer":
        process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
      "X-Title": "Kriyagni",
    },
    body: JSON.stringify({
      model: getOpenRouterModel(),
      max_tokens: params.maxTokens ?? 1024,
      stream: false,
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
    }),
    signal: AbortSignal.timeout(params.timeoutMs ?? 15_000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter error (${response.status}): ${text}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("OpenRouter returned an empty completion");
  }

  return content;
}

export async function* streamOpenRouterChat(params: {
  system: string;
  user: string;
  maxTokens?: number;
}): AsyncGenerator<string> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getOpenRouterApiKey()}`,
      "Content-Type": "application/json",
      "HTTP-Referer":
        process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
      "X-Title": "Kriyagni",
    },
    body: JSON.stringify({
      model: getOpenRouterModel(),
      max_tokens: params.maxTokens ?? 8192,
      stream: true,
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter error (${response.status}): ${text}`);
  }

  if (!response.body) {
    throw new Error("OpenRouter returned an empty response body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;

      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") return;

      try {
        const parsed = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // Skip malformed SSE chunks
      }
    }
  }
}
