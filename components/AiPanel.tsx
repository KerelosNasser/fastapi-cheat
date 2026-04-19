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
  const [panelWidth, setPanelWidth] = useState(440)
  const [isResizing, setIsResizing] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<boolean>(false)

  // Resizing logic
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
  }, [])

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = window.innerWidth - e.clientX
      if (newWidth > 320 && newWidth < 800) {
        setPanelWidth(newWidth)
      }
    }
  }, [isResizing])

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize)
      window.addEventListener("mouseup", stopResizing)
    } else {
      window.removeEventListener("mousemove", resize)
      window.removeEventListener("mouseup", stopResizing)
    }
    return () => {
      window.removeEventListener("mousemove", resize)
      window.removeEventListener("mouseup", stopResizing)
    }
  }, [isResizing, resize, stopResizing])

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
      const conversationHistory = messages // all previous messages
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
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          onClick={closeAI}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Ask the AI"
        aria-modal="true"
        className={`fixed top-0 right-0 bottom-0 z-50 flex flex-col shadow-2xl
          border-l border-[var(--border)] transition-transform duration-[250ms] ease-in-out
          ${isResizing ? "transition-none" : ""}`}
        style={{
          width: `${panelWidth}px`,
          background: "var(--sidebar-bg)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
        aria-hidden={!isOpen}
      >
        {/* Resize Handle */}
        <div
          onMouseDown={startResizing}
          className="absolute top-0 left-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-[var(--fastapi-teal)]/30 transition-colors z-[60]"
          title="Drag to resize"
        />

        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <header
            className="flex items-center justify-between px-4 h-[56px] border-b border-[var(--border)] shrink-0"
            style={{ background: "var(--navbar-bg)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center shadow-sm"
                style={{ background: "var(--fastapi-teal-dim)", border: "1px solid rgba(0,150,136,0.3)" }}>
                <Sparkles size={14} style={{ color: "var(--fastapi-teal)" }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-[var(--foreground)] leading-none">AI Tutor Agent</span>
                <span className="text-[10px] text-[var(--muted)] font-mono mt-1 font-bold">GEMINI 2.0 FLASH</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={handleClear}
                  className="text-[12px] font-bold px-3 py-1 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)]
                    hover:bg-white/5 transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                onClick={closeAI}
                aria-label="Close AI panel"
                className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--muted)]
                  hover:text-[var(--foreground)] hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6 scrollbar-thin">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: "var(--fastapi-teal-dim)", border: "1px solid rgba(0,150,136,0.2)" }}
                >
                  <Sparkles size={32} style={{ color: "var(--fastapi-teal)" }} />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-[var(--foreground)]">Ask anything about FastAPI</h3>
                  <p className="text-[14px] text-[var(--muted)] mt-2 leading-relaxed max-w-[280px]">
                    Get architectural advice, surgical code snippets, and student-focused explanations.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="text-[12px] font-medium px-4 py-2 rounded-xl border border-[var(--border)]
                        text-[var(--muted)] hover:text-[var(--fastapi-teal-light)]
                        hover:border-[var(--fastapi-teal)] hover:bg-[var(--fastapi-teal-dim)]
                        bg-[var(--surface)] transition-all shadow-sm"
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
                className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`text-[11px] font-bold uppercase tracking-widest ${
                    msg.role === "user" ? "text-[var(--muted)]" : ""
                  }`}
                  style={msg.role === "assistant" ? { color: "var(--fastapi-teal)" } : {}}
                >
                  {msg.role === "user" ? "User" : "AI Agent"}
                </div>

                {msg.role === "user" ? (
                  <div
                    className="max-w-[90%] px-4 py-3 rounded-2xl rounded-tr-sm text-[15px]
                      leading-relaxed text-[var(--foreground)] shadow-sm font-medium"
                    style={{ background: "var(--fastapi-teal-dim)", border: "1px solid rgba(0,150,136,0.2)" }}
                  >
                    {msg.content}
                  </div>
                ) : (
                  <div className="w-full">
                    <MarkdownRenderer
                      content={msg.content}
                      isStreaming={isStreaming && i === messages.length - 1}
                    />
                    {!isStreaming && msg.content && (
                      <button
                        onClick={() => handleCopyResponse(msg.content, i)}
                        className="flex items-center gap-1.5 mt-3 text-[12px] font-bold text-[var(--muted)]
                          hover:text-[var(--foreground)] transition-colors group"
                      >
                        {copiedIndex === i ? (
                          <>
                            <Check size={12} className="text-[var(--fastapi-teal)]" />
                            <span className="text-[var(--fastapi-teal)]">Copied Response</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} className="group-hover:text-[var(--fastapi-teal)]" />
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
            className="px-5 py-4 border-t border-[var(--border)] shrink-0"
            style={{ background: "var(--navbar-bg)" }}
          >
            <div
              className="flex items-end gap-3 rounded-2xl border px-4 py-3 transition-all shadow-inner"
              style={{
                background: "var(--surface)",
                borderColor: input ? "var(--fastapi-teal)" : "var(--border)",
                boxShadow: input ? "0 0 0 2px rgba(0,150,136,0.1)" : "none"
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
                className="flex-1 bg-transparent text-[14.5px] text-[var(--foreground)]
                  placeholder:text-[var(--muted)] outline-none border-none resize-none
                  max-h-[150px] leading-relaxed font-medium"
                style={{ fontFamily: "var(--font-sans)" }}
              />
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isStreaming}
                aria-label="Send message"
                className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-all
                  disabled:opacity-20 disabled:cursor-not-allowed shadow-md"
                style={{
                  background: input.trim() && !isStreaming ? "var(--fastapi-teal)" : "var(--surface-hover)",
                  color: input.trim() && !isStreaming ? "white" : "var(--muted)",
                }}
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[11px] font-bold text-[var(--muted)] mt-2.5 text-center opacity-60">
              SHIFT+ENTER FOR NEW LINE · ESC TO CLOSE
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

const QUICK_QUESTIONS = [
  "Path parameters vs Query parameters?",
  "How to use Depends()?",
  "JWT Authentication flow",
  "Pydantic validation tips",
]
