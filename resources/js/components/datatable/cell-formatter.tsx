import { memo, useMemo } from 'react'
import { SmartBadge } from '@/components/smart-badge'
import { SmartButton } from '@/components/smart-button'
import { SmartImagePreview } from '@/components/smart-image-preview'
import { SmartModal } from '@/components/smart-modal'
import { ExtendedForm } from '@/components/form/extended-form'

const COLOR_MAP: Record<string, string> = {
  negro: '#000', marrón: '#7B3F00', acero: '#A8A9AD', cenizo: '#B2BEB5', crema: '#fff0bf', blanco: '#fff', gris: '#808080', dorado: '#DAA520',
  rojo: '#f00', azul: '#00f', verde: '#008000', rosa: '#FFC0CB', naranja: '#FFA500', morado: '#800080', beige: '#F5F5DC', fuego: '#FF4500'
}

const IGNORED_WORDS = new Set(['con', 'y', 'de', 'manchas', 'claro', 'oscuro'])
const SUCCESS_STATES = new Set(['activo', 'abierto', 'completado', 'aprobado', 'confirmado', 'exitoso', 'pagado', 'atendido'])
const WARNING_STATES = new Set(['pendiente', 'en proceso', 'espera', 'revision', 'revisión', 'parcial', 'por pagar'])
const DANGER_STATES = new Set(['inactivo', 'cancelado', 'rechazado', 'fallido', 'eliminado', 'anulado'])

const PHONE_REGEX = /telefono|phone|celular/
const IMAGE_REGEX = /archivo|file|imagen|image|foto/
const DATE_REGEX = /fecha|date/

const EMOJI_MAP: Record<string, string> = {
  canino: '🐶',
  felino: '🐱',
  lagomorfo: '🐰',
  macho: '♂️',
  hembra: '♀️'
}

const EMOJI_REGEX = new RegExp(`\\b(${Object.keys(EMOJI_MAP).join('|')})\\b`, 'gi')

const BooleanBadge = memo(({ value }: { value: any }) => {
  const isTrue = value === 1 || value === true || value === '1'
  return <SmartBadge label={isTrue ? 'SÍ' : 'NO'} variant={isTrue ? 'default' : 'destructive'} />
})

const StatusBadge = memo(({ value }: { value: any }) => {
  const valStr = String(value).toLowerCase().trim()
  const variant = SUCCESS_STATES.has(valStr) ? 'default' : WARNING_STATES.has(valStr) ? 'warning' : DANGER_STATES.has(valStr) ? 'destructive' : 'secondary'
  return <SmartBadge label={String(value).toUpperCase()} variant={variant} />
})

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

const CellImagePreview = memo(({ value }: { value: string }) => {
  const url = String(value)
  const thumbUrl = url.replace(/\.([^.]+)$/, '_thumb.$1')
  return ( <div className="flex justify-center w-full"> <SmartImagePreview url={url} thumbUrl={thumbUrl} size="sm" /> </div> )
})

const PhoneButton = memo(({ value }: { value: string }) => (
  <SmartButton size="xs" buttonColor="green" icon="phone" label={value} href={`https://wa.me/${value}`} target="_blank" rel="noopener noreferrer" tooltip="Abrir WhatsApp" />
))

const RelatedCountButton = memo(({ accessor, value, rowId, tableName, ...props }: any) => {
  const targetTable = accessor.replace(/^total_/, '').trim()
  return (
    <SmartModal title={`${targetTable.toUpperCase()}S DE ${tableName?.toUpperCase() ?? ''}`} description="Consulta todos los registros asociados"
      trigger={<SmartButton size="xs" variant="secondary" icon="paw-print" label={String(value ?? 0)} tooltip={`Ver ${targetTable}s`} {...props} />} >
      {({ close }) => <ExtendedForm recordId={rowId} tableName={targetTable} foreignKey={tableName} onSuccess={close} />}
    </SmartModal>
  )
})

const replaceWithLargeEmojis = (text: string) => {
  const parts = text.split(EMOJI_REGEX)
  if (parts.length === 1) return text

  return parts.map((part, i) => {
    const lower = part.toLowerCase()
    if (EMOJI_MAP[lower]) {
      return (
        <span key={i} className="text-xl leading-none inline-block align-middle mx-0.5 transform scale-150 select-none" title={part}>
          {EMOJI_MAP[lower]}
        </span>
      )
    }
    return part
  })
}

const formatValue = (accessor: string, value: any, type?: string, tableName?: string, rowId?: any) => {
  if (value == null || value === '') return <span className="italic text-muted-foreground/50">null</span>
  if (tableName && accessor === `id_${tableName}`) return <span className="font-semibold opacity-60">{String(value)}</span>
  if (accessor === 'estado' || accessor.startsWith('estado_')) return <StatusBadge value={value} />
  if (type === 'checkbox' || type === 'boolean' || typeof value === 'boolean') return <BooleanBadge value={value} />
  if (accessor === 'mascotas' || accessor.startsWith('total_')) return <RelatedCountButton accessor={accessor} value={value} rowId={rowId} tableName={tableName} />
  if (PHONE_REGEX.test(accessor)) return <PhoneButton value={String(value)} />
  if (accessor.includes('color')) return <ColorCircle value={value} />
  if (IMAGE_REGEX.test(accessor)) return <CellImagePreview value={String(value)} />
  if (DATE_REGEX.test(accessor)) return String(value).replace(/[\sT]00:00:00(\.000Z)?$/, '')
  return replaceWithLargeEmojis(String(value))
}

interface CellFormatterProps { accessor: string; row: any; rowId?: any; type?: string; tableName?: string }
export const CellFormatter = memo(({ accessor, row, rowId, type, tableName }: CellFormatterProps) => ( formatValue(accessor, row[accessor], type, tableName, rowId) ))