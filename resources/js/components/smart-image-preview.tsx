// SmartImagePreview.tsx
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
  const displayThumb = thumbUrl || url
  const containerSizeClass = size === "sm" ? "size-10" : "size-16"
  if (!displayThumb) {
    return (
      <div className={cn("relative flex shrink-0 items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/40 shadow-xs", containerSizeClass)}>
        <ImageIcon className={cn("text-muted-foreground/40", size === "sm" ? "size-4" : "size-6")} />
      </div>
    )
  }
  return (
    <div className={cn("relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted shadow-sm", containerSizeClass)}>
      <img src={displayThumb} alt="Thumbnail" className="h-full w-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity hover:opacity-100">
        <SmartModal trigger={<SmartButton icon={Maximize2} variant="outline" size="xs" tooltip="Inspeccionar HD" />}>
          {({ close }) => (
            <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-hidden p-4" onClick={close}>
              <img src={url || displayThumb} alt="Vista previa HD" className="max-h-[70vh] w-auto rounded-md object-contain shadow-md" />
            </div>
          )}
        </SmartModal>
        {onClear && !disabled && ( <SmartButton icon={Trash2} variant="outline" size="xs" tooltip="Eliminar" onClick={onClear} /> )}
      </div>
    </div>
  )
})
SmartImagePreview.displayName = "SmartImagePreview"