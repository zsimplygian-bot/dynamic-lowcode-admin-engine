import { memo } from "react"
import { cn } from "@/lib/utils"
import { SmartButton } from "@/components/smart-button"
import { SmartModal } from "@/components/smart-modal"
import { useThumb } from "@/hooks/use-thumb"
interface SmartImagePreviewProps { url?: string | null, size?: "sm" | "md" }
export const SmartImagePreview = memo(({ url, size = "md" }: SmartImagePreviewProps) => {
  const { thumbUrl, hdUrl } = useThumb(url)
  if (!thumbUrl) return null
  return (
    <div className={cn("relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted shadow-xs group", size === "sm" ? "size-10" : "size-16")}>
      <img src={thumbUrl} alt="Preview" className="h-full w-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
        <SmartModal trigger={<SmartButton icon="maximize-2" variant="outline" size="xs" tooltip="Inspeccionar HD" />}>
          {({ close }) => (
            <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-hidden p-4" onClick={close}>
              <img src={hdUrl!} alt="Vista previa HD" className="max-h-[70vh] w-auto rounded-md object-contain shadow-md" />
            </div>
          )}
        </SmartModal>
      </div>
    </div>
  )
})