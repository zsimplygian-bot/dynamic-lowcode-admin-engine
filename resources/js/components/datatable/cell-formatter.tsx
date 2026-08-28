import React, { memo, useMemo } from 'react'
import { Phone, PawPrint } from 'lucide-react'
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

const BooleanBadge = memo(({ value }: { value: any }) => {
  const isTrue = value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true'
  return <SmartBadge label={isTrue ? 'Sí' : 'No'} variant={isTrue ? 'default' : 'destructive'} />
})
BooleanBadge.displayName = 'BooleanBadge'

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
  return <div className="flex justify-center"><SmartImagePreview url={url} thumbUrl={getThumbUrl(url)} size="sm" /></div>
})
CellImagePreview.displayName = 'CellImagePreview'

const PhoneButton = memo(({ value }: { value: string }) => (
  <SmartButton size="xs" buttonColor="green" icon={Phone} label={value} href={`https://wa.me/${value}`} target="_blank" rel="noopener noreferrer" tooltip="Abrir WhatsApp" />
))
PhoneButton.displayName = 'PhoneButton'

const PetCountButton = memo(({ value }: { value: any }) => (
  <SmartButton size="xs" variant="secondary" icon={PawPrint} label={String(value)} className="font-semibold cursor-default" />
))
PetCountButton.displayName = 'PetCountButton'

const CUSTOM_RENDERERS: Record<string, (value: any) => React.ReactNode> = {
  precio: (val) => `S/ ${Number(val).toFixed(2)}`,
}

const formatValue = (accessor: string, value: any, type?: string, tableName?: string) => {
  if (value == null || value === '') return <span className="italic text-muted-foreground/50">null</span>
  if (tableName && accessor === `id_${tableName}`) return <span className="font-semibold opacity-60">{String(value)}</span>

  const isBooleanType = type === 'checkbox' || type === 'boolean' || typeof value === 'boolean'
  const isBooleanName = accessor.startsWith('es_') || accessor.startsWith('is_') || accessor.startsWith('tiene_') || accessor.includes('activo')
  const isBinaryValue = value === 0 || value === 1 || value === '0' || value === '1'
  if (isBooleanType || (isBooleanName && isBinaryValue)) return <BooleanBadge value={value} />

  if (accessor.includes('total_mascota') || accessor === 'mascotas') return <PetCountButton value={value} />
  if (CUSTOM_RENDERERS[accessor]) return CUSTOM_RENDERERS[accessor](value)

  const lower = accessor.toLowerCase()
  if (lower.includes('telefono') || lower.includes('phone') || lower.includes('celular')) return <PhoneButton value={String(value)} />
  if (lower.includes('color')) return <ColorCircle value={value} />
  if (lower.includes('archivo') || lower.includes('file') || lower.includes('imagen') || lower.includes('image') || lower.includes('foto')) return <CellImagePreview value={String(value)} />
  if (lower.includes('fecha') || lower.includes('date')) return String(value).replace(/[\sT]00:00:00(\.000Z)?$/, '')

  return String(value)
}

interface CellFormatterProps { accessor: string; row: any; type?: string; tableName?: string }

export const CellFormatter = memo(({ accessor, row, type, tableName }: CellFormatterProps) => {
  return formatValue(accessor, row[accessor], type, tableName)
})
CellFormatter.displayName = 'CellFormatter'