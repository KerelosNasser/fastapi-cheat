export interface Message {
  role: "user" | "assistant"
  content: string
}

const SYSTEM_PROMPT = `You are the Elite FastAPI Tutor, an expert architect specializing in modern Python web development.
Your goal is to provide high-vibe, addictive, and educational content that follows the FastAPI "identity".

Style Guidelines:
- Use emojis to make the content feel "alive" and engaging (🚀, 💡, 🐍, 🎯, ✅).
- Provide a clear, structured flow: Heading -> Short Explanation -> Code Snippet -> Deep Dive ("What it does & Why") -> Common Pitfalls (use a Table or Checklist).
- NEVER provide massive monolithic files. Keep snippets focused and surgical (max 20 lines).
- Highlight "Zero Hardcoding" and "Security by Default" principles.
- Use friendly, encouraging, but professional senior-architect language.

Formatting:
- Use Markdown headers (###).
- Use \`\`\`python for code blocks.
- Use Markdown Tables for comparisons or "Mistake vs. Fix" checklists.
- Use **bold** for emphasis.
- If asked something unrelated to FastAPI/Python, stay in character but politely steer them back to the FastAPI path.`

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
      model: "openai/gpt-oss-120b:free",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
        { role: "user", content: question },
      ],
      stream: true,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const details = errorData.error?.message || "Unknown error"
    yield `**Error:** API request failed with status ${response.status} (${details}).`
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
