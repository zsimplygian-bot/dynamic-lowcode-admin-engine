import React, { useState, useRef, useEffect } from "react"
import { SmartImagePreview } from "@/components/smart-image-preview"
import { SmartButton } from "@/components/smart-button"
import { Upload, ImageIcon, FileText, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FormFilePickerProps {
  id: string
  name?: string
  defaultValue?: string
  accept?: string
  required?: boolean
  disabled?: boolean
  className?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const FormFilePicker = ({ id, name = id, defaultValue, accept, required, disabled, className, onChange }: FormFilePickerProps) => {
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
  const isImage = accept?.includes("image") || preview !== null || ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)

  return (
    <div className={cn("flex items-center gap-2 w-full", className)}>
      {isRemoved && <input type="hidden" name={`_remove_${name}`} value="1" />}
      <input ref={inputRef} id={id} name={name} type="file" accept={accept} required={required} disabled={disabled} onChange={handleFileChange} className="hidden" />
      {preview ? (
        <SmartImagePreview url={preview} thumbUrl={thumbUrl} size="md" disabled={disabled} />
      ) : (
        <div className="relative flex shrink-0 flex-col items-center justify-center size-16 rounded-full border border-dashed border-muted-foreground/60 bg-muted/60 group overflow-hidden">
          {isImage ? <ImageIcon className="size-8 text-muted-foreground/60" /> : <FileText className="size-8 text-muted-foreground/60" />}
          {fileName && ext && <span className="text-[12px] font-bold uppercase text-muted-foreground leading-none mt-0.5 max-w-[90%] truncate">{ext}</span>}
        </div>
      )}
      <div className="flex-1 flex items-center justify-between h-9 px-3 border rounded-md bg-muted/20 overflow-hidden">
        <span className="truncate text-sm">{fileName ?? "No hay archivo seleccionado"}</span>
        {fileName && !disabled && (
          <SmartButton icon={Trash2} variant="ghost" size="sm" tooltip="Eliminar" onClick={handleClear} />
        )}
      </div>
      <SmartButton icon={Upload} tooltip="Seleccionar archivo" disabled={disabled} onClick={triggerSelect} />
    </div>
  )
}