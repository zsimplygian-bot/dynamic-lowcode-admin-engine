import React, { memo, useMemo } from 'react'
import { Phone } from 'lucide-react'
import { SmartBadge } from '@/components/smart-badge'
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
  return <div className="size-7 rounded-full shadow-sm mx-auto transition-transform hover:scale-110 border border-black/20 dark:border-white/40" style={{ background }} title={String(value)} />
})
ColorCircle.displayName = 'ColorCircle'

const getThumbUrl = (url: string) => url.replace(/(\.[^.]+)$/, '_thumb$1')

const CellImagePreview = memo(({ value }: { value: string }) => {
  const url = String(value)
  const thumbUrl = getThumbUrl(url)
  return (
    <div className="flex justify-center">
      <SmartImagePreview {...{ url, thumbUrl, size: 'sm' }} />
    </div>
  )
})
CellImagePreview.displayName = 'CellImagePreview'

const PhoneLink = memo(({ value }: { value: string }) => (
  <a href={`https://wa.me/${value}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 h-6 px-2 text-xs font-medium rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors shrink-0">
    <Phone {...{ className: 'size-3 shrink-0' }} />
    <span>{value}</span>
  </a>
))
PhoneLink.displayName = 'PhoneLink'

const RENDERERS: Record<string, (value: any) => React.ReactNode> = {
  weight: (val) => `${val} kg`,
  activo: (val) => <SmartBadge {...{ label: Boolean(Number(val)) ? 'Activo' : 'Inactivo', variant: Boolean(Number(val)) ? 'default' : 'destructive' }} />,
  is_active: (val) => <SmartBadge {...{ label: Boolean(Number(val)) ? 'Activo' : 'Inactivo', variant: Boolean(Number(val)) ? 'default' : 'destructive' }} />,
  status: (val) => <SmartBadge {...{ label: Boolean(Number(val)) ? 'Activo' : 'Inactivo', variant: Boolean(Number(val)) ? 'default' : 'destructive' }} />
}

const formatValue = (accessor: string, value: any, tableName?: string) => {
  // Única fuente de verdad para valores nulos o vacíos
  if (value == null || value === '') {
    return <span className="italic text-muted-foreground/50">null</span>
  }
  if (tableName && accessor === `id_${tableName}`) {
    return <span className="font-semibold opacity-60">{String(value)}</span>
  }
  if (RENDERERS[accessor]) return RENDERERS[accessor](value)
  if (accessor.includes('telefono') || accessor.includes('phone')) return <PhoneLink {...{ value }} />
  if (accessor.includes('color')) return <ColorCircle {...{ value }} />
  if (accessor.includes('archivo') || accessor.includes('file') || accessor.includes('imagen') || accessor.includes('image') || accessor.includes('foto')) {
    return <CellImagePreview {...{ value }} />
  }
  if (accessor.includes('fecha') || accessor.includes('date')) {
    return String(value).replace(/[\sT]00:00:00(\.000Z)?$/, '')
  }
  return String(value)
}

export const CellFormatter = memo(({ accessor, row, tableName }: { accessor: string; row: any; tableName?: string }) => {
  return formatValue(accessor, row[accessor], tableName)
})
CellFormatter.displayName = 'CellFormatter'