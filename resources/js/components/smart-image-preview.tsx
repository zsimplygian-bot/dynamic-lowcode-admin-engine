import { memo } from "react"
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
  if (!displayThumb) return null
  const sizeClass = size === "sm" ? "size-10" : "size-16"
  return (
    <div className={cn("relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted shadow-xs group", sizeClass)}>
      <img src={displayThumb} alt="Preview" className="h-full w-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
        <SmartModal trigger={<SmartButton icon='maximize-2' variant="outline" size="xs" tooltip="Inspeccionar HD" />}>
          {({ close }) => (
            <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-hidden p-4" onClick={close}>
              <img src={url || displayThumb} alt="Vista previa HD" className="max-h-[70vh] w-auto rounded-md object-contain shadow-md" />
            </div>
          )}
        </SmartModal>
        {onClear && !disabled && <SmartButton icon='trash-2' variant="outline" size="xs" tooltip="Eliminar" onClick={onClear} />}
      </div>
    </div>
  )
})
SmartImagePreview.displayName = "SmartImagePreview"