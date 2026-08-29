import React, { useState, useRef, memo, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SmartImagePreview } from "@/components/smart-image-preview"
import { FileText, X } from "lucide-react"

interface FormFilePickerProps {
  id: string
  name?: string
  defaultValue?: string
  accept?: string
  disabled?: boolean
  type?: "file" | "image"
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const IS_IMAGE_REGEX = /\.(jpg|jpeg|png|webp|avif|gif|svg)(\?.*)?$/i

export const FormFilePicker = memo(({ id, name = id, defaultValue, accept, disabled, type = "file", onChange }: FormFilePickerProps) => {
  const [preview, setPreview] = useState<string | null>(defaultValue ? String(defaultValue) : null)
  const [fileName, setFileName] = useState<string | null>(() => (defaultValue ? String(defaultValue).split("/").pop() ?? null : null))
  const [isRemoved, setIsRemoved] = useState(false)
  const [isBlob, setIsBlob] = useState(false)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const isBlobRef = useRef(isBlob)
  const previewRef = useRef(preview)
  
  isBlobRef.current = isBlob
  previewRef.current = preview

  // Sincronizar únicamente cuando llega una nueva URL desde el servidor y no hay un blob local seleccionado
  useEffect(() => {
    if (isBlobRef.current) return
    
    if (defaultValue && typeof defaultValue === "string") {
      setPreview(defaultValue)
      setFileName(defaultValue.split("/").pop() ?? null)
      setIsRemoved(false)
    } else if (!defaultValue) {
      setPreview(null)
      setFileName(null)
    }
  }, [defaultValue])

  const revokeBlob = useCallback(() => {
    if (previewRef.current && isBlobRef.current) {
      URL.revokeObjectURL(previewRef.current)
      isBlobRef.current = false
    }
  }, [])

  useEffect(() => revokeBlob, [revokeBlob])

  const handleClear = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    revokeBlob()
    setPreview(null)
    setFileName(null)
    setIsBlob(false)
    setIsRemoved(true)
    if (inputRef.current) inputRef.current.value = ""
  }, [revokeBlob])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    revokeBlob()

    if (file) {
      setFileName(file.name)
      if (file.type.startsWith("image/")) {
        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)
        setIsBlob(true)
      } else {
        setPreview(null)
        setIsBlob(false)
      }
      setIsRemoved(false)
    } else {
      handleClear()
    }
    onChange?.(e)
  }, [handleClear, revokeBlob, onChange])

  const isImageType = type === "image" || (accept?.includes("image") ?? false) || Boolean(preview && (isBlob || IS_IMAGE_REGEX.test(preview)))
  const thumbUrl = preview && !isBlob ? preview.replace(/(\.[a-zA-Z0-9]+)$/, "_thumb$1") : preview
  const showImagePreview = isImageType && Boolean(preview)
  const hasFile = Boolean(preview || fileName)

  return (
    <div className="flex items-center gap-2">
      {isRemoved && <input type="hidden" name={`_remove_${name}`} value="1" />}
      {showImagePreview ? (
        <SmartImagePreview url={preview} thumbUrl={thumbUrl} size="md" disabled={disabled} onClear={handleClear} />
      ) : hasFile ? (
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-muted">
          <FileText className="h-6 w-6 text-muted-foreground" />
          {!disabled && (
            <Button type="button" variant="destructive" size="icon" className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full p-0 shadow-sm" onClick={handleClear}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ) : null}
      <div className="relative flex-1">
        <Input ref={inputRef} id={id} name={name} type="file" accept={accept ?? (type === "image" ? "image/*" : undefined)} disabled={disabled} onChange={handleFileChange} className="cursor-pointer" />
      </div>
    </div>
  )
})

FormFilePicker.displayName = "FormFilePicker"