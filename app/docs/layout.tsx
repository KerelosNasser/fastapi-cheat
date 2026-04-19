import Navbar from "@/components/Navbar"
import AiPanel from "@/components/AiPanel"
import AskAIButton from "@/components/AskAIButton"

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {children}
      <AiPanel />
      <AskAIButton />
    </div>
  )
}
