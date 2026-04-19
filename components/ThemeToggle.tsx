"use client"

import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    if (stored === "light") {
      setIsDark(false)
      document.documentElement.classList.remove("dark")
    } else {
      setIsDark(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex items-center justify-center w-8 h-8 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors"
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )
}
