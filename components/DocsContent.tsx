"use client"

import { useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"

export default function DocsContent({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    // Sync with sidebar's localStorage
    const checkCollapsed = () => {
      const stored = localStorage.getItem("sidebar-collapsed")
      setIsCollapsed(stored === "true")
    }

    checkCollapsed()
    
    // Listen for storage changes (in case of multiple tabs, though unlikely to matter here)
    window.addEventListener("storage", checkCollapsed)
    
    // Custom event for same-tab updates
    const handleSidebarToggle = () => checkCollapsed()
    window.addEventListener("sidebar-toggle", handleSidebarToggle)

    return () => {
      window.removeEventListener("storage", checkCollapsed)
      window.removeEventListener("sidebar-toggle", handleSidebarToggle)
    }
  }, [])

  const marginLeft = isMobile ? "0px" : (isCollapsed ? "60px" : "260px")

  return (
    <main 
      className="flex-1 min-h-[calc(100vh-52px)] overflow-y-auto transition-all duration-300"
      style={{ marginLeft }}
    >
      {children}
    </main>
  )
}
