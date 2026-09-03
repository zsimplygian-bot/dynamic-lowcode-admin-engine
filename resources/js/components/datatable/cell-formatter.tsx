import React, { memo, useMemo } from 'react'
import { Phone, PawPrint } from 'lucide-react'
import { SmartBadge } from '@/components/smart-badge'
import { SmartButton } from '@/components/smart-button'
import { SmartImagePreview } from '@/components/smart-image-preview'
import { SmartModal } from '@/components/smart-modal'
import { ExtendedForm } from '@/components/form/extended-form'
const COLOR_MAP: Record<string, string> = {
  negro: '#000', marrón: '#7B3F00', acero: '#A8A9AD', cenizo: '#B2BEB5',
  crema: '#fff0bf', blanco: '#fff', gris: '#808080', dorado: '#DAA520',
  rojo: '#f00', azul: '#00f', verde: '#008000', rosa: '#FFC0CB',
  naranja: '#FFA500', morado: '#800080', beige: '#F5F5DC', fuego: '#FF4500'
}
const IGNORED_WORDS = new Set(['con', 'y', 'de', 'manchas', 'claro', 'oscuro'])
const IS_EMOJI = /\p{Extended_Pictographic}/u
const FormattedTextWithEmoji = memo(({ text }: { text: string }) => {
  const segmenter = useMemo(() => new Intl.Segmenter(undefined, { granularity: 'grapheme' }), [])
  const segments = Array.from(segmenter.segment(text))
  return (
    <span className="inline-flex items-center gap-1">
      {segments.map((segment, index) => {
        const char = segment.segment
        if (IS_EMOJI.test(char)) {
          return (
            <span key={index} className="text-2xl leading-none inline-block transform select-none align-middle" style={{ fontSize: '1.9rem' }}> {char} </span>
          )
        }
        return <React.Fragment key={index}>{char}</React.Fragment>
      })}
    </span>
  )
})
FormattedTextWithEmoji.displayName = 'FormattedTextWithEmoji'
const BooleanBadge = memo(({ value }: { value: any }) => {
  const isTrue = value === 1
  return <SmartBadge label={isTrue ? 'Sí' : 'No'} variant={isTrue ? 'default' : 'destructive'} />
})
BooleanBadge.displayName = 'BooleanBadge'
const StatusBadge = memo(({ value }: { value: any }) => {
  const valStr = String(value).toLowerCase().trim()
  const isSuccess = ['activo', 'abierto', 'completado', 'aprobado', 'confirmado', 'exitoso', 'pagado', 'atendido'].some(s => valStr.includes(s))
  const isWarning = ['pendiente', 'en proceso', 'espera', 'revision', 'revisión', 'parcial', 'por pagar'].some(s => valStr.includes(s))
  const isDanger = ['inactivo', 'cancelado', 'rechazado', 'fallido', 'eliminado', 'anulado'].some(s => valStr.includes(s))
  let variant: 'default' | 'warning' | 'destructive' | 'secondary' = 'default'
  if (isSuccess) variant = 'default'
  else if (isWarning) variant = 'warning'
  else if (isDanger) variant = 'destructive'
  else variant = 'secondary'
  return <SmartBadge label={String(value)} variant={variant} />
})
StatusBadge.displayName = 'StatusBadge'
const ColorCircle = memo(({ value }: { value: any }) => {
  const background = useMemo(() => {
    if (!value) return null
    const words = String(value).toLowerCase().split(/\s+/).filter((w) => w && !IGNORED_WORDS.has(w))
    const colors = words.map((w) => COLOR_MAP[w] ?? '#999')
    return colors.length > 1 ? `linear-gradient(to right, ${colors.join(', ')})` : colors[0]
  }, [value])
  if (!background) return '—'
  return <div className="size-7 rounded-full shadow-sm mx-auto border border-black/20 dark:border-white/40" style={{ background }} title={String(value)} />
})
ColorCircle.displayName = 'ColorCircle'
const CellImagePreview = memo(({ value }: { value: string }) => {
  const url = String(value)
  const thumbUrl = url.replace(/\.([^.]+)$/, '_thumb.$1')
  return (
    <div className="flex justify-center w-full"> <SmartImagePreview url={url} thumbUrl={thumbUrl} size="sm" /> </div>
  )
})
CellImagePreview.displayName = 'CellImagePreview'
const PhoneButton = memo(({ value }: { value: string }) => (
  <SmartButton size="xs" buttonColor="green" icon={Phone} label={value} href={`https://wa.me/${value}`} target="_blank" rel="noopener noreferrer" tooltip="Abrir WhatsApp" />
))
PhoneButton.displayName = 'PhoneButton'
const RelatedCountButton = memo(({ accessor, value, rowId, tableName, ...props }: any) => {
  const targetTable = accessor.replace(/^total_/, '').trim()
  return (
    <SmartModal 
      title={`${targetTable.toUpperCase()}S DE ${tableName?.toUpperCase() ?? ''}`} description="Consulta todos los registros asociados"
      trigger={<SmartButton size="xs" variant="secondary" icon={PawPrint} label={String(value ?? 0)} tooltip={`Ver ${targetTable}s`} {...props} />} >
      {({ close }) => ( <ExtendedForm recordId={rowId} tableName={targetTable} foreignKey={tableName} onSuccess={close} /> )}
    </SmartModal>
  )
})
RelatedCountButton.displayName = 'RelatedCountButton'
const CUSTOM_RENDERERS: Record<string, (value: any) => React.ReactNode> = {
  precio: (val) => `S/ ${Number(val).toFixed(2)}`,
  peso: (val) => `${val} kg`,
}
const formatValue = (accessor: string, value: any, type?: string, tableName?: string, row?: any, rowId?: any) => {
  if (value == null || value === '') return <span className="italic text-muted-foreground/50">null</span>
  if (tableName && accessor === `id_${tableName}`) return <span className="font-semibold opacity-60">{String(value)}</span>
  if (accessor.startsWith('estado_') || accessor === 'estado') return <StatusBadge value={value} />
  const isBooleanType = type === 'checkbox' || type === 'boolean' || typeof value === 'boolean'
  if (isBooleanType) return <BooleanBadge value={value} />
  if (accessor.startsWith('total_') || accessor === 'mascotas') {
    return <RelatedCountButton accessor={accessor} value={value} rowId={rowId} tableName={tableName} />
  }
  if (CUSTOM_RENDERERS[accessor]) return CUSTOM_RENDERERS[accessor](value)
  if (accessor.includes('telefono') || accessor.includes('phone') || accessor.includes('celular')) return <PhoneButton value={String(value)} />
  if (accessor.includes('color')) return <ColorCircle value={value} />
  if (accessor.includes('archivo') || accessor.includes('file') || accessor.includes('imagen') || accessor.includes('image') || accessor.includes('foto')) return <CellImagePreview value={String(value)} />
  if (accessor.includes('fecha') || accessor.includes('date')) return String(value).replace(/[\sT]00:00:00(\.000Z)?$/, '')
  const strValue = String(value)
  return IS_EMOJI.test(strValue) ? <FormattedTextWithEmoji text={strValue} /> : strValue
}
interface CellFormatterProps { accessor: string; row: any; rowId?: any; type?: string; tableName?: string }
export const CellFormatter = memo(({ accessor, row, rowId, type, tableName }: CellFormatterProps) => {
  return formatValue(accessor, row[accessor], type, tableName, row, rowId)
})
CellFormatter.displayName = 'CellFormatter'