"use client"

// Simple module-level pub/sub store to share AI panel state across components

type Listener = (state: { isOpen: boolean; question: string }) => void

let state = { isOpen: false, question: "" }
const listeners = new Set<Listener>()

function notify() {
  listeners.forEach((l) => l({ ...state }))
}

export function openAIPanel(question = "") {
  state = { isOpen: true, question }
  notify()
}

export function closeAIPanel() {
  state = { isOpen: false, question: "" }
  notify()
}

import { useState, useEffect } from "react"

export function useAIPanel() {
  const [panelState, setPanelState] = useState(state)

  useEffect(() => {
    const listener: Listener = (s) => setPanelState({ ...s })
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  return {
    isOpen: panelState.isOpen,
    initialQuestion: panelState.question,
    openAI: openAIPanel,
    closeAI: closeAIPanel,
  }
}
