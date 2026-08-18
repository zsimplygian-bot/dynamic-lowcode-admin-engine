import React, { memo, useState, useEffect } from 'react'
import { SmartButton } from '@/components/smart-button'
import { SmartModal } from '@/components/smart-modal'
import { Image as ImageIcon, Maximize2, Trash2 } from 'lucide-react'

interface SmartImagePreviewProps {
  url?: string | null
  thumbUrl?: string | null
  size?: 'sm' | 'md'
  disabled?: boolean
  onClear?: (e: React.MouseEvent) => void
}

export const SmartImagePreview = memo(({ url, thumbUrl, size = 'md', disabled, onClear }: SmartImagePreviewProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const containerClasses = `relative flex ${size === 'sm' ? 'size-10' : 'h-16 w-16'} shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted shadow-sm`
  const displayThumb = thumbUrl ?? url

  if (!displayThumb) {
    return (
      <div {...{ className: containerClasses }}>
        <ImageIcon {...{ className: 'h-5 w-5 text-muted-foreground' }} />
      </div>
    )
  }

  return (
    <div {...{ className: containerClasses }}>
      <img {...{ src: displayThumb, alt: 'Thumbnail', className: 'h-full w-full object-cover' }} />
      <div {...{ className: 'absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 hover:opacity-100 transition-opacity' }}>
        <SmartButton {...{ size: 'xs', variant: 'ghost', icons: Maximize2, iconSize: 12, tooltip: 'Inspeccionar HD', onClick: () => setIsModalOpen(true), className: 'text-white hover:bg-white/20' }} />
        {onClear && !disabled && (
          <SmartButton {...{ size: 'xs', variant: 'ghost', icons: Trash2, iconSize: 12, tooltip: 'Eliminar', onClick: onClear, className: 'text-white hover:bg-white/20' }} />
        )}
      </div>
      {isMounted && (
        <SmartModal {...{ open: isModalOpen, onOpenChange: setIsModalOpen, size: 'lg' }}>
          {() => (
            <div {...{ className: 'flex flex-1 items-center justify-center p-4 min-h-[300px] overflow-hidden' }}>
              <img {...{ src: url ?? displayThumb, alt: 'Vista previa HD', className: 'max-h-[70vh] w-auto object-contain rounded-md shadow-md' }} />
            </div>
          )}
        </SmartModal>
      )}
    </div>
  )
})

SmartImagePreview.displayName = 'SmartImagePreview'