"use client"

import ThemeToggle from "./ThemeToggle"
import SearchBar from "./SearchBar"

export default function Navbar() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 h-[52px] flex items-center px-4 gap-4
        bg-[var(--navbar-bg)] border-b border-teal-900/20"
      style={{ borderBottomColor: "rgba(0,150,136,0.15)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 shrink-0 select-none">
        <FastAPILogo />
        <div className="flex items-baseline gap-1.5">
          <span className="text-[var(--foreground)] font-bold text-sm tracking-tight">FastAPI</span>
          <span className="text-[var(--muted)] text-sm font-normal">Docs</span>
        </div>
      </div>

      {/* Search — centered */}
      <div className="flex-1 flex justify-center">
        <SearchBar />
      </div>

      {/* Right: theme toggle + version badge */}
      <div className="flex items-center gap-2 shrink-0">
        <ThemeToggle />
        <span className="font-mono text-[11px] px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--muted)] bg-[var(--surface)]">
          v0.1.0
        </span>
      </div>
    </header>
  )
}

function FastAPILogo() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="12" height="12" rx="3" fill="#009688" />
      <rect x="8" y="8" width="12" height="12" rx="3" fill="#26A69A" opacity="0.85" />
    </svg>
  )
}
