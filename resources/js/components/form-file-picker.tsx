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
  const previewRef = useRef(preview)
  const isBlobRef = useRef(isBlob)
  const onChangeRef = useRef(onChange)

  previewRef.current = preview
  isBlobRef.current = isBlob
  onChangeRef.current = onChange

  // Re-sincronizar el estado de la vista previa cuando el backend cargue los datos (defaultValue cambie)
  useEffect(() => {
    if (defaultValue && !isBlobRef.current) {
      const valStr = String(defaultValue)
      setPreview(valStr)
      setFileName(valStr.split("/").pop() ?? null)
      setIsRemoved(false)
    } else if (!defaultValue && !isBlobRef.current) {
      setPreview(null)
      setFileName(null)
    }
  }, [defaultValue])

  const isImageType = type === "image" || (accept?.includes("image") ?? false) || (Boolean(preview) && IS_IMAGE_REGEX.test(preview ?? ""))

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
        setPreview(URL.createObjectURL(file))
        setIsBlob(true)
      } else {
        setPreview(null)
        setIsBlob(false)
      }
      setIsRemoved(false)
    } else {
      handleClear()
    }
    onChangeRef.current?.(e)
  }, [handleClear, revokeBlob])

  // Si es una URL del backend (no blob), usamos la imagen directa
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