import React, { useState, useRef, memo, useCallback, useEffect } from "react"
import { SmartImagePreview } from "@/components/smart-image-preview"
import { SmartButton } from "@/components/smart-button"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"
interface FormFilePickerProps {
  id: string
  name?: string
  defaultValue?: string
  accept?: string
  disabled?: boolean
  className?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}
export const FormFilePicker = memo(({ id, name = id, defaultValue, accept = "image/*", disabled, className, onChange }: FormFilePickerProps) => {
  const [preview, setPreview] = useState<string | null>(defaultValue ?? null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isRemoved, setIsRemoved] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (!preview?.startsWith("blob:")) {
      setPreview(defaultValue ?? null)
      setIsRemoved(false)
      if (defaultValue) setFileName(defaultValue.split("/").pop() ?? null)
    }
  }, [defaultValue])
  useEffect(() => {
    if (!preview?.startsWith("blob:")) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])
  const handleClear = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    setPreview(null)
    setFileName(null)
    setIsRemoved(true)
    if (inputRef.current) inputRef.current.value = ""
  }, [])
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setPreview(file ? URL.createObjectURL(file) : null)
    setFileName(file ? file.name : null)
    setIsRemoved(!file)
    onChange?.(e)
  }, [onChange])
  const triggerSelect = useCallback(() => {
    inputRef.current?.click()
  }, [])
  const thumbUrl = preview && !preview.startsWith("blob:") ? preview.replace(/\.([^.]+)$/, "_thumb.$1") : null
  return (
    <div className={cn("flex items-center gap-2 w-full", className)}>
      {isRemoved && <input type="hidden" name={`_remove_${name}`} value="1" />}
      <input ref={inputRef} id={id} name={name} type="file" accept={accept} disabled={disabled} onChange={handleFileChange} className="hidden" />
      <SmartImagePreview url={preview} thumbUrl={thumbUrl} size="md" disabled={disabled} onClear={preview ? handleClear : undefined} />
      <div className="flex-1 flex items-center h-9 px-3 border border-input rounded-md bg-muted/20 select-none">
        <span className={cn("text-xs", fileName ? "text-foreground font-medium" : "text-muted-foreground italic")}>
          {fileName ?? "No hay archivo seleccionado"}
        </span>
      </div>
      <SmartButton icon={Upload} tooltip="Seleccionar archivo" disabled={disabled} onClick={triggerSelect} />
    </div>
  )
})
FormFilePicker.displayName = "FormFilePicker"