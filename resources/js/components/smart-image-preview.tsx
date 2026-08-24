import React, { memo } from "react"
import { Image as ImageIcon, Maximize2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { SmartButton } from "@/components/smart-button"
import { SmartModal } from "@/components/smart-modal"
interface SmartImagePreviewProps {
  url?: string | null
  thumbUrl?: string | null
  size?: "sm" | "md"
  disabled?: boolean
  onClear?: (e: React.MouseEvent) => void
}
export const SmartImagePreview = memo(({ url, thumbUrl, size = "md", disabled, onClear }: SmartImagePreviewProps) => {
  const displayThumb = thumbUrl ?? url

  if (!displayThumb) {
    return (
      <div {...{ className: cn("relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted shadow-sm", size === "sm" ? "size-10" : "h-16 w-16") }}>
        <ImageIcon {...{ className: "h-5 w-5 text-muted-foreground" }} />
      </div>
    )
  }
  return (
    <div {...{ className: cn("relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted shadow-sm", size === "sm" ? "size-10" : "h-16 w-16") }}>
      <img {...{ src: displayThumb, alt: "Thumbnail", className: "h-full w-full object-cover" }} />
      <div {...{ className: "absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity hover:opacity-100" }}>
        <SmartModal {...{ size: "lg",
          trigger: <SmartButton {...{ icon: Maximize2, variant: "ghost", size: "xs", tooltip: "Inspeccionar HD", className: "text-white hover:bg-white/20" }} />
        }}>
          {({ close }) => (
            <div {...{ className: "flex min-h-[300px] flex-1 items-center justify-center overflow-hidden p-4", onClick: close }}>
              <img {...{ src: url ?? displayThumb, alt: "Vista previa HD", className: "max-h-[70vh] w-auto object-contain rounded-md shadow-md" }} />
            </div>
          )}
        </SmartModal>
        {onClear && !disabled && (
          <SmartButton {...{ icon: Trash2, variant: "ghost", size: "xs", tooltip: "Eliminar", onClick: onClear, className: "text-white hover:bg-white/20" }} />
        )}
      </div>
    </div>
  )
})
SmartImagePreview.displayName = "SmartImagePreview"