import React, { memo, useMemo } from 'react'
import { Phone } from 'lucide-react'
import { SmartBadge } from '@/components/smart-badge'
import { SmartButton } from '@/components/smart-button'
import { SmartImagePreview } from '@/components/smart-image-preview'
const COLOR_MAP: Record<string, string> = {
  negro: '#000', marrón: '#7B3F00', acero: '#A8A9AD', cenizo: '#B2BEB5',
  crema: '#fff0bf', blanco: '#fff', gris: '#808080', dorado: '#DAA520',
  rojo: '#f00', azul: '#00f', verde: '#008000', rosa: '#FFC0CB',
  naranja: '#FFA500', morado: '#800080', beige: '#F5F5DC', fuego: '#FF4500'
}
const IGNORED_WORDS = new Set(['con', 'y', 'de', 'manchas', 'claro', 'oscuro'])
const ColorCircle = memo(({ value }: { value: any }) => {
  const background = useMemo(() => {
    if (!value) return null
    const words = String(value).toLowerCase().split(/\s+/).filter((w) => w && !IGNORED_WORDS.has(w))
    const colors = words.map((w) => COLOR_MAP[w] ?? '#999')
    return colors.length > 1 ? `linear-gradient(to right, ${colors.join(', ')})` : colors[0]
  }, [value])
  if (!background) return '—'
  return <div {...{ className: 'size-7 rounded-full shadow-sm mx-auto transition-transform hover:scale-110 border border-black/20 dark:border-white/40', style: { background }, title: String(value) }} />
})
ColorCircle.displayName = 'ColorCircle'
const getThumbUrl = (url: string) => url.replace(/(\.[^.]+)$/, '_thumb$1')
const CellImagePreview = memo(({ value }: { value: string }) => {
  const url = String(value)
  const thumbUrl = getThumbUrl(url)
  return (
    <div {...{ className: 'flex justify-center' }}>
      <SmartImagePreview {...{ url, thumbUrl, size: 'sm' }} />
    </div>
  )
})
CellImagePreview.displayName = 'CellImagePreview'
const RENDERERS: Record<string, (value: any) => React.ReactNode> = {
  weight: (val) => `${val} kg`,
  activo: (val) => <SmartBadge {...{ label: Boolean(Number(val)) ? 'Activo' : 'Inactivo', variant: Boolean(Number(val)) ? 'default' : 'destructive' }} />,
  is_active: (val) => <SmartBadge {...{ label: Boolean(Number(val)) ? 'Activo' : 'Inactivo', variant: Boolean(Number(val)) ? 'default' : 'destructive' }} />,
  status: (val) => <SmartBadge {...{ label: Boolean(Number(val)) ? 'Activo' : 'Inactivo', variant: Boolean(Number(val)) ? 'default' : 'destructive' }} />
}
const formatValue = (accessor: string, value: any, tableName?: string) => {
  if (value == null || value === '') {
    return <span {...{ className: 'italic text-muted-foreground/40' }}>null</span>
  }
  // Resalta en negrita y opacidad suave si coincide con la PK de la tabla principal (ej: id_historia)
  if (tableName && accessor === `id_${tableName}`) {
    return <span {...{ className: 'font-semibold opacity-60' }}>{String(value)}</span>
  }
  if (RENDERERS[accessor]) return RENDERERS[accessor](value)
  if (accessor.includes('telefono') || accessor.includes('phone')) {
    const cleanNumber = String(value).replace(/\D/g, '')
    return <SmartButton {...{ href: `https://wa.me/${cleanNumber}`, isExternal: true, icons: Phone, label: String(value), size: 'xs', buttonColor: 'green' }} />
  }
  if (accessor.includes('color')) return <ColorCircle {...{ value }} />
  if (accessor.includes('archivo') || accessor.includes('file') || accessor.includes('imagen') || accessor.includes('image') || accessor.includes('foto')) {
    return <CellImagePreview {...{ value }} />
  }
  return String(value)
}
export const CellFormatter = memo(({ accessor, row, tableName }: { accessor: string; row: any; tableName?: string }) => {
  return formatValue(accessor, row[accessor], tableName)
})
CellFormatter.displayName = 'CellFormatter'