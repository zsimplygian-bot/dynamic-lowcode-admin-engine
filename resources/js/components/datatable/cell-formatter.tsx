import { memo } from 'react'
import { usePage } from '@inertiajs/react'
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
const EMOJI_MAP: Record<string, string> = { canino: '🐶', felino: '🐱', lagomorfo: '🐰', macho: '♂️', hembra: '♀️' }
const EMOJI_REGEX = new RegExp(`\\b(${Object.keys(EMOJI_MAP).join('|')})\\b`, 'gi')

const ACTION_MAP: Record<string, { label: string; className?: string; variant?: any }> = {
  s: { label: 'STORE', className: 'bg-blue-600 text-white hover:bg-blue-700' },
  u: { label: 'UPDATE', className: 'bg-green-600 text-white hover:bg-green-700' },
  d: { label: 'DELETE', variant: 'destructive' },
}

// 1. Subcomponentes ligeros y directos
const BooleanBadge = ({ value }: { value: any }) => {
  const isTrue = Boolean(value) && value !== '0'
  return <SmartBadge label={isTrue ? 'SÍ' : 'NO'} variant={isTrue ? 'default' : 'destructive'} />
}

const StatusBadge = ({ value }: { value: any }) => {
  const val = String(value).toLowerCase().trim()
  const variant = SUCCESS_STATES.has(val) ? 'default' : WARNING_STATES.has(val) ? 'warning' : DANGER_STATES.has(val) ? 'destructive' : 'secondary'
  return <SmartBadge label={String(value).toUpperCase()} variant={variant} />
}

const ActionBadge = ({ value }: { value: any }) => {
  const cfg = ACTION_MAP[String(value).toLowerCase().trim()]
  return <SmartBadge label={cfg?.label ?? String(value).toUpperCase()} variant={cfg?.variant ?? 'secondary'} className={cfg?.className} />
}

// Resuelve la tabla por ID o por nombre sin prop drilling (usa usePage de Inertia)
const TableBadge = ({ value }: { value: any }) => {
  const { tables_meta = {} } = usePage<any>().props
  // Busca primero por clave directa (nombre) o por el ID numérico del TableMetadata
  const meta = (tables_meta[value] ?? Object.values(tables_meta).find((t: any) => String(t.id) === String(value) || t.name === value)) as any
  const label = meta?.label ?? meta?.name ?? String(value)
  return (
    <SmartBadge
      label={label.toUpperCase()}
      icon={meta?.icon}
      style={meta?.color ? { backgroundColor: meta.color, color: '#fff' } : undefined}
      variant={meta?.color ? undefined : 'secondary'}
    />
  )
}

const ColorCircle = ({ value }: { value: any }) => {
  const colors = String(value).toLowerCase().split(/\s+/).filter(w => w && !IGNORED_WORDS.has(w)).map(w => COLOR_MAP[w] ?? '#999')
  const background = colors.length > 1 ? `linear-gradient(to right, ${colors.join(', ')})` : (colors[0] || '#999')
  return <div className="size-7 rounded-full shadow-sm mx-auto border border-black/20 dark:border-white/40" style={{ background }} title={String(value)} />
}

const CellImagePreview = ({ value }: { value: string }) => (
  <div className="flex justify-center w-full"><SmartImagePreview url={value} thumbUrl={value.replace(/\.([^.]+)$/, '_thumb.$1')} size="sm" /></div>
)

const PhoneButton = ({ value }: { value: string }) => (
  <SmartButton size="xs" buttonColor="green" icon="phone" label={value} href={`https://wa.me/${value}`} target="_blank" rel="noopener noreferrer" tooltip="Abrir WhatsApp" />
)

const RelatedCountButton = ({ accessor, value, rowId, tableName, ...props }: any) => {
  const target = accessor === 'mascotas' ? 'mascota' : accessor
  return (
    <SmartModal title={`${target.toUpperCase()}S DE ${tableName?.toUpperCase()} ${rowId}`} description="Consulta todos los registros asociados"
      trigger={<SmartButton size="xs" variant="secondary" icon="paw-print" label={String(value ?? 0)} tooltip={`Ver ${target}s`} {...props} />}>
      {({ close }) => <ExtendedForm recordId={rowId} tableName={target} foreignKey={tableName} onSuccess={close} />}
    </SmartModal>
  )
}

const replaceWithLargeEmojis = (text: string) => {
  const parts = text.split(EMOJI_REGEX)
  if (parts.length === 1) return text
  return parts.map((part, i) => EMOJI_MAP[part.toLowerCase()] ? (
    <span key={i} className="text-xl leading-none inline-block align-middle mx-0.5 transform scale-150 select-none" title={part}>{EMOJI_MAP[part.toLowerCase()]}</span>
  ) : part)
}

// 2. Formateador principal
export const formatCellValue = (accessor: string, value: any, tableName?: string, rowId?: any) => {
  if (value == null || value === '') return <span className="italic text-muted-foreground/50">null</span>
  if (accessor === 'table') return <TableBadge value={value} />
  if (accessor === 'id' || accessor === `row`) return <span className="font-semibold opacity-60">{value}</span>
  if (accessor === 'action') return <ActionBadge value={value} />
  if (accessor === 'activo' || accessor === 'fecha_nacimiento_estimada' || typeof value === 'boolean') return <BooleanBadge value={value} />
  if (accessor === 'estado' || accessor.startsWith('estado_')) return <StatusBadge value={value} />
  if (accessor === 'mascotas') return <RelatedCountButton accessor={accessor} value={value} rowId={rowId} tableName={tableName} />
  if (/telefono|phone|celular/.test(accessor)) return <PhoneButton value={String(value)} />
  if (accessor.includes('color')) return <ColorCircle value={value} />
  if (/archivo|file|imagen|image|foto/.test(accessor)) return <CellImagePreview value={String(value)} />
  if (/fecha|date/.test(accessor)) return String(value).replace(/[\sT]00:00:00(\.000Z)?$/, '')
  return replaceWithLargeEmojis(String(value))
}

// 3. Componente con memo para evitar re-renders masivos al seleccionar checkboxes
interface CellFormatterProps { accessor: string; row: any; rowId?: any; tableName?: string }
export const CellFormatter = memo(({ accessor, row, rowId, tableName }: CellFormatterProps) => (
  formatCellValue(accessor, row[accessor], tableName, rowId)
))

export default CellFormatter