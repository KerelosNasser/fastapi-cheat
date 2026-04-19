import {
  Rocket,
  Route,
  ArrowLeftRight,
  GitFork,
  Database,
  Shield,
  Layers,
  Timer,
  type LucideIcon,
} from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
  rocket: Rocket,
  route: Route,
  "arrow-left-right": ArrowLeftRight,
  "git-fork": GitFork,
  database: Database,
  shield: Shield,
  layers: Layers,
  timer: Timer,
}

export function getSectionIcon(name: string): LucideIcon {
  return iconMap[name] ?? Rocket
}
