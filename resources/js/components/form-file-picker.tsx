import React, { useState, useRef, useEffect } from "react"
import { SmartImagePreview } from "@/components/smart-image-preview"
import { SmartButton } from "@/components/smart-button"
import { Upload, ImageIcon, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormFilePickerProps {
  id: string
  name?: string
  defaultValue?: string
  accept?: string
  required?: boolean
  disabled?: boolean
  className?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const FormFilePicker = ({
  id,
  name = id,
  defaultValue,
  accept,
  required,
  disabled,
  className,
  onChange,
}: FormFilePickerProps) => {
  const [fileState, setFileState] = useState(() => ({
    preview: defaultValue ?? null,
    fileName: defaultValue ? defaultValue.split("/").pop() ?? null : null,
    isRemoved: false,
  }))

  const inputRef = useRef<HTMLInputElement | null>(null)
  const { preview, fileName, isRemoved } = fileState

  useEffect(() => {
    if (!preview?.startsWith("blob:")) {
      setFileState({
        preview: defaultValue ?? null,
        fileName: defaultValue ? defaultValue.split("/").pop() ?? null : null,
        isRemoved: false,
      })
    }
  }, [defaultValue])

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    setFileState({ preview: null, fileName: null, isRemoved: true })
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setFileState({
      preview: file ? (file.type.startsWith("image/") ? URL.createObjectURL(file) : null) : null,
      fileName: file ? file.name : null,
      isRemoved: !file,
    })
    onChange?.(e)
  }

  const triggerSelect = () => {
    if (!disabled) inputRef.current?.click()
  }

  const ext = fileName?.split(".").pop()?.toLowerCase() ?? ""
  const thumbUrl = preview && !preview.startsWith("blob:") ? preview.replace(/\.([^.]+)$/, "_thumb.$1") : null

  return (
    <div className={cn("flex items-center gap-2 w-full", className)}>
      {isRemoved && <input type="hidden" name={`_remove_${name}`} value="1" />}
      <input ref={inputRef} id={id} name={name} type="file" accept={accept} required={required} disabled={disabled} onChange={handleFileChange} className="hidden" />

      {preview ? (
        <SmartImagePreview url={preview} thumbUrl={thumbUrl} size="md" disabled={disabled} onClear={handleClear} />
      ) : (
        <div className="relative flex shrink-0 flex-col items-center justify-center size-16 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/40 shadow-xs group overflow-hidden">
          <ImageIcon className="size-6 text-muted-foreground/40" />
          {fileName && ext && <span className="text-[9px] font-bold uppercase text-muted-foreground leading-none mt-0.5 max-w-[90%] truncate">{ext}</span>}
          {fileName && !disabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <SmartButton icon={Trash2} variant="outline" size="xs" tooltip="Eliminar" onClick={handleClear} />
            </div>
          )}
        </div>
      )}

      <div className="flex-1 flex items-center h-9 px-3 border rounded-md bg-muted/20 overflow-hidden">
        <span className={cn("text-xs truncate", fileName ? "text-foreground font-medium" : "text-muted-foreground italic")}>
          {fileName ?? "No hay archivo seleccionado"}
        </span>
      </div>

      <SmartButton icon={Upload} tooltip="Seleccionar archivo" disabled={disabled} onClick={triggerSelect} />
    </div>
  )
}