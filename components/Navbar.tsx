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
      <div className="flex items-center gap-3 shrink-0 select-none cursor-pointer" onClick={() => window.location.href = "/"}>
        <FastAPILogo />
        <div className="flex items-baseline gap-1.5">
          <span className="text-[var(--foreground)] font-bold text-lg tracking-tight">FastAPI</span>
          <span className="text-[var(--fastapi-teal-light)] text-sm font-semibold opacity-90">Docs</span>
        </div>
      </div>

      {/* Search — centered */}
      <div className="flex-1 flex justify-center">
        <SearchBar />
      </div>

      {/* Right: theme toggle + version badge */}
      <div className="flex items-center gap-3 shrink-0">
        <ThemeToggle />
        <span className="font-mono text-[12px] font-bold px-3 py-1 rounded-full border border-[var(--fastapi-teal)]/30 text-[var(--fastapi-teal-light)] bg-[var(--fastapi-teal-dim)]">
          v0.1.0
        </span>
      </div>
    </header>
  )
}

function FastAPILogo() {
  return (
    <svg
      width="28"
      height="28"
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
