"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { X, Send, Copy, Check, Sparkles } from "lucide-react"
import { useAIPanel } from "@/hooks/useAIPanel"
import { streamAI } from "@/lib/ai"
import MarkdownRenderer from "./MarkdownRenderer"
import type { Message } from "@/lib/ai"

export default function AiPanel() {
  const { isOpen, initialQuestion, closeAI } = useAIPanel()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<boolean>(false)

  // Pre-fill input from search when opening
  useEffect(() => {
    if (isOpen) {
      if (initialQuestion) {
        setInput(initialQuestion)
      }
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen, initialQuestion])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isStreaming) closeAI()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [isOpen, isStreaming, closeAI])

  const handleSubmit = useCallback(async () => {
    const question = input.trim()
    if (!question || isStreaming) return

    const userMsg: Message = { role: "user", content: question }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput("")
    setIsStreaming(true)
    abortRef.current = false

    // Add empty assistant message
    setMessages((prev) => [...prev, { role: "assistant", content: "" }])

    try {
      let fullContent = ""
      const conversationHistory = messages.slice(0, -0) // all previous messages
      for await (const chunk of streamAI(conversationHistory, question)) {
        if (abortRef.current) break
        fullContent += chunk
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: "assistant", content: fullContent }
          return updated
        })
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: "assistant",
          content: "**Error:** Failed to get a response. Please check your API key and try again.",
        }
        return updated
      })
    } finally {
      setIsStreaming(false)
    }
  }, [input, messages, isStreaming])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleCopyResponse = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  const handleClear = () => {
    setMessages([])
    setInput("")
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
          onClick={closeAI}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Ask the AI"
        aria-modal="true"
        className={`fixed top-0 right-0 bottom-0 w-[440px] z-50 flex flex-col shadow-2xl
          border-l border-[var(--border)] transition-transform duration-[250ms] ease-in-out`}
        style={{
          background: "var(--sidebar-bg)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
        aria-hidden={!isOpen}
      >
        <div className="contents">
          {/* Header */}
          <header
            className="flex items-center justify-between px-4 h-[52px] border-b border-[var(--border)] shrink-0"
            style={{ background: "var(--navbar-bg)" }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded flex items-center justify-center"
                style={{ background: "var(--fastapi-teal-dim)", border: "1px solid rgba(0,150,136,0.2)" }}>
                <Sparkles size={11} style={{ color: "var(--fastapi-teal)" }} />
              </div>
              <span className="text-[13px] font-semibold text-[var(--foreground)]">Ask the AI</span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                style={{ color: "var(--muted)", background: "var(--surface)" }}
              >
                FastAPI Tutor
              </span>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={handleClear}
                  className="text-[11px] px-2 py-1 rounded text-[var(--muted)] hover:text-[var(--foreground)]
                    hover:bg-white/5 transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                onClick={closeAI}
                aria-label="Close AI panel"
                className="flex items-center justify-center w-7 h-7 rounded text-[var(--muted)]
                  hover:text-[var(--foreground)] hover:bg-white/10 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--fastapi-teal-dim)", border: "1px solid rgba(0,150,136,0.2)" }}
                >
                  <Sparkles size={20} style={{ color: "var(--fastapi-teal)" }} />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[var(--foreground)]">Ask anything about FastAPI</p>
                  <p className="text-[12px] text-[var(--muted)] mt-1">
                    Get focused snippets, explanations, and best practices.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="text-[11px] px-2.5 py-1 rounded-full border border-[var(--border)]
                        text-[var(--muted)] hover:text-[var(--fastapi-teal-light)]
                        hover:border-[var(--fastapi-teal)] hover:bg-[var(--fastapi-teal-dim)]
                        bg-[var(--surface)] transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col gap-1.5 ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`text-[10px] font-semibold uppercase tracking-wide ${
                    msg.role === "user" ? "text-[var(--muted)]" : ""
                  }`}
                  style={msg.role === "assistant" ? { color: "var(--fastapi-teal)" } : {}}
                >
                  {msg.role === "user" ? "You" : "AI Tutor"}
                </div>

                {msg.role === "user" ? (
                  <div
                    className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-tr-sm text-[13px]
                      leading-relaxed text-[var(--foreground)]"
                    style={{ background: "var(--fastapi-teal-dim)", border: "1px solid rgba(0,150,136,0.2)" }}
                  >
                    {msg.content}
                  </div>
                ) : (
                  <div
                    className="w-full px-3.5 py-3 rounded-xl rounded-tl-sm"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    <MarkdownRenderer
                      content={msg.content}
                      isStreaming={isStreaming && i === messages.length - 1}
                    />
                    {!isStreaming && msg.content && (
                      <button
                        onClick={() => handleCopyResponse(msg.content, i)}
                        className="flex items-center gap-1 mt-2 text-[11px] text-[var(--muted)]
                          hover:text-[var(--foreground)] transition-colors"
                      >
                        {copiedIndex === i ? (
                          <>
                            <Check size={10} style={{ color: "var(--fastapi-teal)" }} />
                            <span style={{ color: "var(--fastapi-teal)" }}>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={10} />
                            <span>Copy response</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="px-4 py-3 border-t border-[var(--border)] shrink-0"
            style={{ background: "var(--navbar-bg)" }}
          >
            <div
              className="flex items-end gap-2 rounded-xl border px-3 py-2 transition-colors"
              style={{
                background: "var(--surface)",
                borderColor: input ? "var(--fastapi-teal)" : "var(--border)",
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about FastAPI... (Enter to send)"
                rows={1}
                disabled={isStreaming}
                className="flex-1 bg-transparent text-[13px] text-[var(--foreground)]
                  placeholder:text-[var(--muted)] outline-none border-none resize-none
                  max-h-[100px] leading-relaxed"
                style={{ fontFamily: "var(--font-sans)" }}
              />
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isStreaming}
                aria-label="Send message"
                className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: input.trim() && !isStreaming ? "var(--fastapi-teal)" : "var(--surface-hover)",
                  color: input.trim() && !isStreaming ? "white" : "var(--muted)",
                }}
              >
                <Send size={12} />
              </button>
            </div>
            <p className="text-[10px] text-[var(--muted)] mt-1.5 text-center">
              Shift+Enter for new line · Esc to close
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

const QUICK_QUESTIONS = [
  "How do path parameters work?",
  "What is Depends()?",
  "How do I add JWT auth?",
  "How do I handle CORS?",
]
