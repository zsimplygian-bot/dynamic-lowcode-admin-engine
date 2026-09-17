import { useState, useEffect } from "react"
import { SmartButton } from "@/components/smart-button"
import { useTranslation } from "@/hooks/use-translation"
import { Maximize, Minimize } from "lucide-react"
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error)
    } else {
      document.exitFullscreen?.().catch(console.error)
    }
  }
  return { isFullscreen, toggleFullscreen }
}
export const FullscreenButton = () => {
  const { isFullscreen, toggleFullscreen } = useFullscreen()
  const t = useTranslation()
  return ( <SmartButton variant="ghost" onClick={toggleFullscreen} icon={isFullscreen ? Minimize : Maximize} label={isFullscreen ? t("Exit fullscreen") : t("Fullscreen")} />
  )
}