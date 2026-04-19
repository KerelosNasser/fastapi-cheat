"use client"

import { useState, useEffect } from "react"

type Listener = (isOpen: boolean) => void

let isOpen = false
const listeners = new Set<Listener>()

function notify() {
  listeners.forEach((l) => l(isOpen))
}

export function openSidebar() {
  isOpen = true
  notify()
}

export function closeSidebar() {
  isOpen = false
  notify()
}

export function toggleSidebar() {
  isOpen = !isOpen
  notify()
}

export function useSidebarState() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(isOpen)

  useEffect(() => {
    const listener: Listener = (s) => setIsSidebarOpen(s)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  return {
    isOpen: isSidebarOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,
  }
}
