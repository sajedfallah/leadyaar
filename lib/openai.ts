type ResponseOutputItem = {
  type?: string;
  content?: Array<{ type?: string; text?: string }>;
};

type OpenAIResponse = {
  output?: ResponseOutputItem[];
  error?: { message?: string } | null;
};

export function hasOpenAI() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function createAIResponse(args: {
  input: string;
  instructions: string;
  webSearch?: boolean;
  maxOutputTokens?: number;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const payload: Record<string, unknown> = {
    model: process.env.OPENAI_MODEL || "gpt-5.6-sol",
    input: args.input,
    instructions: args.instructions,
    max_output_tokens: args.maxOutputTokens ?? 1400,
    store: false,
  };
  if (args.webSearch) payload.tools = [{ type: "web_search" }];

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = (await response.json()) as OpenAIResponse;
  if (!response.ok) throw new Error(data.error?.message || `OpenAI HTTP ${response.status}`);

  return (data.output ?? [])
    .filter((item) => item.type === "message")
    .flatMap((item) => item.content ?? [])
    .filter((part) => part.type === "output_text")
    .map((part) => part.text ?? "")
    .join("\n")
    .trim();
}
