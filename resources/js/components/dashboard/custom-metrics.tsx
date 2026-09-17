import { useState, useMemo, useCallback, memo } from 'react'
import { Plus, Trash2, BarChart2, Hash, Settings2, Check, X } from 'lucide-react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useApi } from '@/hooks/use-api'
import { SmartButton } from '@/components/smart-button'
import { SmartModal } from '@/components/smart-modal'
import { SmartTooltip } from '@/components/smart-tooltip'
import { FormGroup } from '@/components/form-group'
import { DatePicker, type DateRange } from '@/components/date-picker'
import { AsyncState } from '@/components/async-state'

const EMPTY_ARR: any[] = []

const TABLES_OPTIONS = [
  { id: 'cliente', label: 'Cliente' },
  { id: 'mascota', label: 'Mascota'},
  { id: 'cita', label: 'Cita' },
  { id: 'historia', label: 'Historia Clínica' },
  { id: 'producto', label: 'Producto' },
  { id: 'procedimiento', label: 'Procedimiento' },
  { id: 'categoria_producto', label: 'Cat. Producto' },
  { id: 'categoria_procedimiento', label: 'Cat. Procedimiento' },
  { id: 'especie', label: 'Especie' },
  { id: 'raza', label: 'Raza' },
  { id: 'motivo', label: 'Motivo' },
]

const SIZE_OPTIONS = [
  { id: 'full', label: 'Todo el largo (100%)' },
  { id: 'half', label: 'La mitad (50%)' },
  { id: 'third', label: 'El tercio (33%)' },
  { id: 'quarter', label: 'Un cuarto (25%)' },
]

const DEFAULT_WIDGETS: any[] = []

const TYPE_BTNS = [
  { type: 'counter', icon: Hash, tip: 'Contador' },
  { type: 'bar', icon: BarChart2, tip: 'Barras' },
] as const

const SIZE_CONFIG: Record<string, string> = {
  full: 'col-span-12',
  half: 'col-span-12 md:col-span-6',
  third: 'col-span-12 md:col-span-6 lg:col-span-4',
  quarter: 'col-span-12 md:col-span-6 lg:col-span-3',
}

const CARD_CONFIG_FIELDS = [
  { name: 'title', label: 'WIDGET TITLE', required: true },
  { name: 'tableName', label: 'TABLE', type: 'select', options: TABLES_OPTIONS },
  { name: 'size', label: 'WIDTH', type: 'select', options: SIZE_OPTIONS },
]

const fmtDate = (d?: string) => d ? d.split('-').reverse().join('/') : ''

const WidgetConfigModal = memo(function WidgetConfigModal({ widget, onSave }: any) {
  const [form, setForm] = useState({ title: widget.title || 'NEW METRIC', tableName: widget.tableName, size: widget.size ?? 'half' })

  const handleOpen = (open: boolean) => {
    if (open) setForm({ title: widget.title || 'NEW METRIC', tableName: widget.tableName, size: widget.size ?? 'half' })
  }

  return (
    <SmartModal title="CONFIGURAR TARJETA" onOpenChange={handleOpen} trigger={<SmartButton icon={Settings2} variant="outline" size="sm" tooltip="Configurar" />} >
      {({ close }) => (
        <div className="space-y-4">
          <FormGroup fields={CARD_CONFIG_FIELDS} values={form} onChange={(name, val) => setForm((p) => ({ ...p, [name]: val }))} />
          <div className="flex justify-end gap-2 pt-2">
            <SmartButton variant="secondary" icon={X} label="Cancelar" onClick={close} />
            <SmartButton icon={Check} label="Listo" onClick={() => { onSave(form); close() }} />
          </div>
        </div>
      )}
    </SmartModal>
  )
})

const WidgetCard = memo(function WidgetCard({ widget, initialCount = 0, onUpdate, onRemove }: any) {
  const [dateRange, setDateRange] = useState<DateRange>({})

  const apiConfig = useMemo(() => ({
    params: {
      ...(dateRange?.from && { from: String(dateRange.from) }),
      ...(dateRange?.to && { to: String(dateRange.to) }),
    }
  }), [dateRange?.from, dateRange?.to])

  const { data: res, isLoading: loading, error, refetch } = useApi(
    widget.tableName ? `/api/dashboard/metrics/${widget.tableName}` : null,
    { config: apiConfig }
  )

  const series = res?.series ?? EMPTY_ARR
  const count = res?.count ?? initialCount
  const maxValue = useMemo(() => Math.max(...series.map((s: any) => Number(s.y) || 0), 1), [series])
  const avgValue = series.length ? (count / series.length).toFixed(1) : '0'
  const sizeSpan = SIZE_CONFIG[widget.size ?? 'half'] ?? 'col-span-12 md:col-span-6'
  const displayTitle = widget.title?.trim() || 'CUSTOM METRIC'

  return (
    <div className={`flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-xs gap-4 overflow-hidden transition-all ${sizeSpan}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex flex-col min-w-0">
          <span className="text-base font-bold uppercase truncate">{displayTitle}</span>
          <span className="text-xs text-muted-foreground truncate">Promedio: {avgValue}/día</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          <DatePicker mode="range" variant="button" value={dateRange} onChange={setDateRange} placeholder="Fecha" iconSize={16} />
          {TYPE_BTNS.map(({ type, icon, tip }) => (
            <SmartButton key={type} icon={icon} size="sm" variant={widget.type === type ? 'default' : 'outline'} onClick={() => onUpdate(widget.id, { type })} tooltip={tip} />
          ))}
          <WidgetConfigModal widget={widget} onSave={(patch: any) => onUpdate(widget.id, patch)} />
          <SmartButton icon={Trash2} variant="destructive" size="sm" tooltip="Eliminar" onClick={() => onRemove(widget.id)}
            confirmation={{ title: "Eliminar Tarjeta", description: "¿Estás seguro de que deseas eliminar esta tarjeta de métrica?" }} />
        </div>  
      </div>

      <div className="flex items-center justify-center min-h-[220px] w-full overflow-hidden">
        <AsyncState isLoading={loading} error={error} minHeight="min-h-[220px]" onRetry={refetch}>
          {widget.type === 'counter' ? (
            <div className="flex flex-col items-center">
              <span className="text-6xl font-extrabold">{count}</span>
              <span className="text-sm text-muted-foreground uppercase mt-3 font-medium">Registros totales</span>
            </div>
          ) : !series.length ? ( <span className="text-sm text-muted-foreground italic">Sin actividad registrada</span>
          ) : (
            <div className="w-full space-y-3 overflow-hidden">
              <div className="flex items-end gap-2.5 h-44 w-full justify-center pt-4 border-b border-muted">
                {series.map((item: any, idx: number) => {
                  const heightPercent = Math.max(((Number(item.y) || 0) / maxValue) * 100, 12)
                  return (
                    <SmartTooltip key={idx} content={`${fmtDate(item.x)} — ${item.y} registros`} side="top">
                      <div className="flex-1 flex flex-col items-center h-full justify-end min-w-0 group cursor-pointer relative">
                        <span className="text-[11px] font-bold text-foreground mb-1 block">{item.y}</span>
                        <div style={{ height: `${heightPercent}%` }} className="w-full bg-primary/70 group-hover:bg-primary rounded-t-md transition-colors" />
                      </div>
                    </SmartTooltip>
                  )
                })}
              </div>
              <div className="flex justify-between text-xs font-semibold text-muted-foreground px-0.5">
                <span>{fmtDate(series[0]?.x)}</span> <span>{fmtDate(series[series.length - 1]?.x)}</span>
              </div>
            </div>
          )}
        </AsyncState>
      </div>
    </div>
  )
})

export default function CustomDashboardWidgets({ counts = {} }: { counts?: Record<string, number> }) {
  const [widgets, setWidgets] = useLocalStorage('custom_dashboard_widgets', DEFAULT_WIDGETS)

  const addWidget = useCallback(() => {
    const uuid = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    setWidgets((prev: any[]) => [
      ...prev, 
      { id: uuid, title: 'NEW METRIC', tableName: 'cliente', type: 'counter', size: 'half' }
    ])
  }, [setWidgets])

  const removeWidget = useCallback((id: string) => {
    setWidgets((prev: any[]) => prev.filter((w) => w.id !== id))
  }, [setWidgets])

  const updateWidget = useCallback((id: string, patch: any) => {
    setWidgets((prev: any[]) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)))
  }, [setWidgets])

  return (
    <div className="w-full space-y-4 overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold tracking-wider">CUSTOM METRICS</h2> 
        <SmartButton icon={Plus} label="Card" size="sm" variant="outline" onClick={addWidget} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {widgets.map((widget: any) => (
          <WidgetCard key={widget.id} widget={widget} initialCount={counts[widget.tableName] ?? 0} onUpdate={updateWidget} onRemove={removeWidget} />
        ))}
      </div>
    </div>
  )
}