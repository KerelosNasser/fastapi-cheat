"use client"

import { Sparkles } from "lucide-react"
import { useAIPanel } from "@/hooks/useAIPanel"

export default function AskAIButton() {
  const { openAI } = useAIPanel()

  return (
    <button
      onClick={() => openAI()}
      aria-label="Ask AI about FastAPI"
      className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full
        shadow-lg transition-all hover:scale-105 active:scale-95"
      style={{
        background: "var(--fastapi-teal)",
        color: "white",
        boxShadow: "0 4px 24px rgba(0,150,136,0.4)",
      }}
    >
      <Sparkles size={14} />
      <span className="text-[13px] font-medium">Ask AI</span>
    </button>
  )
}
