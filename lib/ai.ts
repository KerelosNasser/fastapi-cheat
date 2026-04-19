export interface Message {
  role: "user" | "assistant"
  content: string
}

const SYSTEM_PROMPT = `You are an expert FastAPI tutor for beginner-to-intermediate Python developers.
Rules:
- NEVER provide full working applications or complete file implementations.
- Always provide short focused snippets (max 15 lines) with clear explanations.
- After every snippet, explain WHAT it does and WHY, then how to use it.
- Highlight common mistakes and how to avoid them.
- Use friendly, encouraging language suitable for students.
- Format responses using markdown: use \`\`\`python for code, **bold** for emphasis, and bullet lists.
- If asked something unrelated to FastAPI or Python web development, politely redirect.`

export async function* streamAI(
  messages: Message[],
  question: string,
): AsyncGenerator<string, void, unknown> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
  if (!apiKey) {
    yield "**Error:** OpenRouter API key not configured. Please add `NEXT_PUBLIC_OPENROUTER_API_KEY` to your environment variables."
    return
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://fastapi-docs.app",
      "X-Title": "FastAPI Educational Docs",
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
        { role: "user", content: question },
      ],
      stream: true,
    }),
  })

  if (!response.ok) {
    yield `**Error:** API request failed with status ${response.status}.`
    return
  }

  const reader = response.body?.getReader()
  if (!reader) {
    yield "**Error:** No response body."
    return
  }

  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue
      const data = line.slice(6).trim()
      if (data === "[DONE]") return

      try {
        const parsed = JSON.parse(data)
        const delta = parsed.choices?.[0]?.delta?.content
        if (delta) yield delta
      } catch {
        // Skip malformed SSE lines
      }
    }
  }
}
