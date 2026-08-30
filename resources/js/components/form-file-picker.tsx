// FormFilePicker.tsx
import React, { useState, useRef, memo, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { SmartImagePreview } from "@/components/smart-image-preview"

interface FormFilePickerProps {
  id: string
  name?: string
  defaultValue?: string
  accept?: string
  disabled?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const FormFilePicker = memo(({ id, name = id, defaultValue, accept = "image/*", disabled, onChange }: FormFilePickerProps) => {
  const [preview, setPreview] = useState<string | null>(defaultValue ?? null)
  const [isRemoved, setIsRemoved] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!preview?.startsWith("blob:")) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  const handleClear = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    setPreview(null)
    setIsRemoved(true)
    if (inputRef.current) inputRef.current.value = ""
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setPreview(file ? URL.createObjectURL(file) : null)
    setIsRemoved(!file)
    onChange?.(e)
  }, [onChange])

  return (
    <div className="flex items-center gap-2">
      {isRemoved && <input type="hidden" name={`_remove_${name}`} value="1" />}

      {/* Renderizado siempre presente */}
      <SmartImagePreview url={preview} size="md" disabled={disabled} onClear={preview ? handleClear : undefined} />

      <div className="relative flex-1">
        <Input ref={inputRef} id={id} name={name} type="file" accept={accept} disabled={disabled} onChange={handleFileChange} className="cursor-pointer" />
      </div>
    </div>
  )
})

FormFilePicker.displayName = "FormFilePicker"