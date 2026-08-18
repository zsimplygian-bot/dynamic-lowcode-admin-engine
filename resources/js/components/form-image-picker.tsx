import React, { useState, useRef, memo, useCallback, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { SmartImagePreview } from '@/components/smart-image-preview'
interface FormImagePickerProps {
  id: string
  name?: string
  defaultValue?: string
  accept?: string
  disabled?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}
export const FormImagePicker = memo(({ id, name = id, defaultValue, accept = 'image/*', disabled, onChange }: FormImagePickerProps) => {
  const [preview, setPreview] = useState<string | null>(defaultValue ? String(defaultValue) : null)
  const [isRemoved, setIsRemoved] = useState(false)
  const [isBlob, setIsBlob] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    return () => {
      if (preview && isBlob) URL.revokeObjectURL(preview)
    }
  }, [preview, isBlob])
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (preview && isBlob) URL.revokeObjectURL(preview)
      setPreview(URL.createObjectURL(file))
      setIsBlob(true)
      setIsRemoved(false)
    }
    onChange?.(e)
  }
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (preview && isBlob) URL.revokeObjectURL(preview)
    setPreview(null)
    setIsBlob(false)
    setIsRemoved(true)
    if (inputRef.current) inputRef.current.value = ''
  }, [preview, isBlob])
  const thumbUrl = preview && !isBlob ? preview.replace(/(\.[a-zA-Z0-9]+)$/, '_thumb$1') : preview
  return (
    <div {...{ className: 'flex items-center gap-4' }}>
      {isRemoved && <input {...{ type: 'hidden', name: `_remove_${name}`, value: '1' }} />}
      <SmartImagePreview {...{ url: preview, thumbUrl, size: 'md', disabled, onClear: preview ? handleClear : undefined }} />
      <div {...{ className: 'relative flex-1' }}>
        <Input {...{ ref: inputRef, id, name, type: 'file', accept, disabled, onChange: handleFileChange, className: 'cursor-pointer' }} />
      </div>
    </div>
  )
})
FormImagePicker.displayName = 'FormImagePicker'