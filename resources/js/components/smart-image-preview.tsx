// SmartImagePreview.tsx
import React, { memo } from "react"
import { Image as ImageIcon, Maximize2, Trash2, FileText, FileArchive, FileCode, FileSpreadsheet, File } from "lucide-react"
import { cn } from "@/lib/utils"
import { SmartButton } from "@/components/smart-button"
import { SmartModal } from "@/components/smart-modal"

interface SmartImagePreviewProps {
  url?: string | null
  thumbUrl?: string | null
  fileName?: string | null
  fileType?: string | null
  size?: "sm" | "md"
  disabled?: boolean
  onClear?: (e: React.MouseEvent) => void
}

const getFileIcon = (ext?: string, mime?: string, iconClass = "size-6 text-muted-foreground") => {
  const e = ext?.toLowerCase()
  const m = mime?.toLowerCase()
  if (m?.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(e ?? "")) return <ImageIcon className={iconClass} />
  if (m?.includes("pdf") || e === "pdf") return <FileText className={cn(iconClass, "text-red-500")} />
  if (m?.includes("zip") || m?.includes("rar") || ["zip", "rar", "7z", "tar", "gz"].includes(e ?? "")) return <FileArchive className={cn(iconClass, "text-amber-500")} />
  if (m?.includes("excel") || m?.includes("spreadsheet") || ["xls", "xlsx", "csv"].includes(e ?? "")) return <FileSpreadsheet className={cn(iconClass, "text-emerald-500")} />
  if (m?.includes("json") || m?.includes("javascript") || ["js", "ts", "json", "php", "html", "css"].includes(e ?? "")) return <FileCode className={cn(iconClass, "text-blue-500")} />
  return <File className={iconClass} />
}

export const SmartImagePreview = memo(({ url, thumbUrl, fileName, fileType, size = "md", disabled, onClear }: SmartImagePreviewProps) => {
  const ext = fileName?.split(".").pop()
  const isImage = (fileType?.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext?.toLowerCase() ?? "")) || Boolean(url || thumbUrl)
  const displayThumb = thumbUrl || url
  const containerSizeClass = size === "sm" ? "size-10" : "size-16"
  const iconSizeClass = size === "sm" ? "size-4" : "size-6"

  if (!fileName && !displayThumb) {
    return (
      <div className={cn("relative flex shrink-0 items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/40 shadow-xs", containerSizeClass)}>
        <File className={cn("text-muted-foreground/40", iconSizeClass)} />
      </div>
    )
  }

  if (!isImage || !displayThumb) {
    return (
      <div className={cn("relative flex shrink-0 flex-col items-center justify-center overflow-hidden rounded-lg border bg-muted shadow-sm group", containerSizeClass)}>
        {getFileIcon(ext, fileType ?? undefined, iconSizeClass)}
        {ext && <span className="text-[9px] font-bold uppercase text-muted-foreground leading-none mt-0.5 max-w-[90%] truncate">{ext}</span>}
        {onClear && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <SmartButton icon={Trash2} variant="outline" size="xs" tooltip="Eliminar" onClick={onClear} />
          </div>
        )}
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
        {onClear && !disabled && <SmartButton icon={Trash2} variant="outline" size="xs" tooltip="Eliminar" onClick={onClear} />}
      </div>
    </div>
  )
})
SmartImagePreview.displayName = "SmartImagePreview"