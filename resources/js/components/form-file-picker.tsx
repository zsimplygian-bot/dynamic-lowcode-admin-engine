import React, { useRef, useMemo, useEffect } from "react"
import { SmartImagePreview } from "@/components/smart-image-preview"
import { SmartButton } from "@/components/smart-button"
import { DynamicIcon } from "@/components/dynamic-icon"
import { cn } from "@/lib/utils"
export interface FormFilePickerProps {
  id?: string
  name?: string
  value?: File | string | null
  defaultValue?: string
  accept?: string
  required?: boolean
  disabled?: boolean
  className?: string
  onChange?: (file: File | null) => void
}
export const FormFilePicker = ({ id, name, value, defaultValue, accept = "image/*", required, disabled, className, onChange }: FormFilePickerProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const fieldName = name ?? id ?? "file"
  const current = value ?? defaultValue
  const { previewUrl, fileName, isBlob } = useMemo(() => {
  if (current instanceof File) return { previewUrl: URL.createObjectURL(current), fileName: current.name, isBlob: true }
  if (typeof current === "string" && current.startsWith("/")) {
    return { previewUrl: current, fileName: current.split("/").pop()?.split("?")[0] ?? "archivo", isBlob: false }
  }
  return { previewUrl: null, fileName: null, isBlob: false }
}, [current])
  useEffect(() => {
    return () => { if (isBlob && previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl, isBlob])
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (inputRef.current) inputRef.current.value = ""
    onChange?.(null)
  }
  const ext = fileName?.split(".").pop()?.toLowerCase() ?? ""
  const isImage = accept.includes("image") || ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)
  return (
    <div className={cn("flex items-center gap-2 w-full", className)}>
      <input ref={inputRef} id={id ?? fieldName} name={fieldName} type="file" accept={accept} required={required && !previewUrl} disabled={disabled}
        onChange={(e) => onChange?.(e.target.files?.[0] ?? null)} className="hidden" />
      {previewUrl && isImage ? ( <SmartImagePreview url={previewUrl} size="md" />
      ) : (
        <div className="relative flex shrink-0 flex-col items-center justify-center size-14 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/40 overflow-hidden">
          <DynamicIcon name={isImage ? "image" : "file-text"} className="size-6 text-muted-foreground/60" />
          {ext && <span className="text-[10px] font-bold uppercase text-muted-foreground mt-0.5 max-w-[90%] truncate">{ext}</span>}
        </div>
      )}
      <div className="flex-1 flex items-center justify-between h-9 px-3 border rounded-md bg-muted/20 overflow-hidden text-sm">
        <span className="truncate text-muted-foreground">{fileName ?? "No hay archivo seleccionado"}</span>
        {fileName && !disabled && <SmartButton type="button" icon="trash-2" variant="ghost" size="sm" tooltip="Eliminar" onClick={handleClear} />}
      </div>
      <SmartButton type="button" icon="upload" tooltip="Seleccionar archivo" disabled={disabled} onClick={() => inputRef.current?.click()} />
    </div>
  )
}
export default FormFilePicker