import { useState, useEffect } from 'react'
import { Plus, Trash2, BarChart2, Hash, TrendingUp } from 'lucide-react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { SmartButton } from '@/components/smart-button'
import { SmartModal } from '@/components/smart-modal'
import { FormGroup } from '@/components/form-group'
import { DatePicker, type DateRange } from '@/components/date-picker'

const TABLES_OPTIONS = [
  { label: 'Cliente', value: 'cliente' },
  { label: 'Mascota', value: 'mascota' },
  { label: 'Cita', value: 'cita' },
  { label: 'Historia Clínica', value: 'historia' },
  { label: 'Producto', value: 'producto' },
  { label: 'Procedimiento', value: 'procedimiento' },
]

const DEFAULT_WIDGETS = [
  { id: '1', title: 'Total Citas', tableName: 'cita', type: 'counter' },
  { id: '2', title: 'Mascotas Activas', tableName: 'mascota', type: 'bar' },
]

function WidgetCard({ widget, initialCount = 0, dateRange, onUpdateType, onRemove }: { widget: any; initialCount?: number; dateRange?: DateRange; onUpdateType: (id: string, t: string) => void; onRemove: (id: string) => void }) {
  const [series, setSeries] = useState<any[]>([])
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    const params = new URLSearchParams()
    if (dateRange?.from) params.append('from', String(dateRange.from))
    if (dateRange?.to) params.append('to', String(dateRange.to))

    const query = params.toString() ? `?${params.toString()}` : ''

    fetch(`/api/dashboard/metrics/${widget.tableName}${query}`)
      .then((res) => res.json())
      .then((res) => {
        if (isMounted) {
          setSeries(res.series ?? [])
          if (res.count !== undefined) setCount(res.count)
          setLoading(false)
        }
      })
      .catch(() => { if (isMounted) setLoading(false) })

    return () => { isMounted = false }
  }, [widget.tableName, widget.type, dateRange])

  const maxValue = Math.max(...series.map((s) => Number(s.y) || 0), 1)
  const avgValue = series.length ? (count / series.length).toFixed(1) : 0

  const formatDateDetail = (dateStr: string) => {
    if (!dateStr) return ''
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
  }

  // Margen de seguridad del 2% a 98% en X para evitar desbordes de trazos/círculos
  const points = series.map((item, idx) => {
    const x = 2 + (idx / (series.length - 1 || 1)) * 96
    const y = 90 - ((Number(item.y) || 0) / maxValue) * 65 - 12
    return { x, y, val: item.y, date: item.x }
  })

  return (
    <div className="col-span-1 md:col-span-2 flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-xs gap-4 overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <span className="text-base font-bold uppercase truncate">{widget.title}</span>
          <span className="text-xs text-muted-foreground truncate">Promedio: {avgValue}/día</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <SmartButton icon={Hash} variant={widget.type === 'counter' ? 'default' : 'ghost'} size="sm" onClick={() => onUpdateType(widget.id, 'counter')} tooltip="Contador" />
          <SmartButton icon={BarChart2} variant={widget.type === 'bar' ? 'default' : 'ghost'} size="sm" onClick={() => onUpdateType(widget.id, 'bar')} tooltip="Barras" />
          <SmartButton icon={TrendingUp} variant={widget.type === 'line' ? 'default' : 'ghost'} size="sm" onClick={() => onUpdateType(widget.id, 'line')} tooltip="Tendencia" />
          <SmartButton icon={Trash2} variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => onRemove(widget.id)} tooltip="Eliminar" />
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[220px] w-full overflow-hidden">
        {widget.type === 'counter' && (
          <div className="flex flex-col items-center">
            <span className="text-6xl font-extrabold">{count}</span>
            <span className="text-sm text-muted-foreground uppercase mt-3 font-medium">Registros totales</span>
          </div>
        )}

        {widget.type === 'bar' && (
          loading ? (
            <span className="text-sm text-muted-foreground animate-pulse">Cargando métricas...</span>
          ) : series.length === 0 ? (
            <span className="text-sm text-muted-foreground italic">Sin actividad registrada</span>
          ) : (
            <div className="w-full space-y-3 overflow-hidden">
              <div className="flex items-end gap-2.5 h-44 w-full justify-center pt-4 border-b border-muted">
                {series.map((item, idx) => {
                  const heightPercent = Math.max(((Number(item.y) || 0) / maxValue) * 100, 12)
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end min-w-0">
                      <span className="text-[11px] font-bold text-foreground mb-1">{item.y}</span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="group relative w-full bg-primary/70 hover:bg-primary rounded-t-md transition-all cursor-pointer"
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs font-semibold px-2.5 py-1 rounded-md shadow-lg border whitespace-nowrap z-10 pointer-events-none">
                          {formatDateDetail(item.x)} — <span className="font-bold">{item.y} reg.</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between text-xs font-semibold text-muted-foreground px-0.5">
                <span>{formatDateDetail(series[0]?.x)}</span>
                <span>{formatDateDetail(series[series.length - 1]?.x)}</span>
              </div>
            </div>
          )
        )}

        {widget.type === 'line' && (
          loading ? (
            <span className="text-sm text-muted-foreground animate-pulse">Cargando métricas...</span>
          ) : series.length === 0 ? (
            <span className="text-sm text-muted-foreground italic">Sin actividad registrada</span>
          ) : (
            <div className="w-full space-y-3 overflow-hidden">
              <div className="relative w-full h-44 pt-4 border-b border-muted overflow-hidden">
                <svg viewBox="0 0 100 90" className="w-full h-full">
                  <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-primary"
                    points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                  />
                  {points.map((p, idx) => (
                    <g key={idx} className="group cursor-pointer">
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="4.5"
                        className="fill-background stroke-primary stroke-[2.5] group-hover:r-6 transition-all"
                      />
                      <text
                        x={p.x}
                        y={p.y - 8}
                        textAnchor="middle"
                        className="text-[9px] font-extrabold fill-foreground pointer-events-none"
                      >
                        {p.val}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
              <div className="flex justify-between text-xs font-semibold text-muted-foreground px-0.5">
                <span>{formatDateDetail(series[0]?.x)}</span>
                <span>{formatDateDetail(series[series.length - 1]?.x)}</span>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default function CustomDashboardWidgets({ counts = {} }: { counts?: Record<string, number> }) {
  const [widgets, setWidgets] = useLocalStorage('custom_dashboard_widgets', DEFAULT_WIDGETS)
  const [dateRange, setDateRange] = useState<DateRange>({})
  const [form, setForm] = useState({ title: '', tableName: 'cliente', type: 'counter' })

  const addWidget = (closeModal: () => void) => {
    if (!form.title) return
    setWidgets((prev: any[]) => [...prev, { ...form, id: crypto.randomUUID() }])
    setForm({ title: '', tableName: 'cliente', type: 'counter' })
    closeModal()
  }

  const removeWidget = (id: string) => setWidgets((prev: any[]) => prev.filter((w) => w.id !== id))
  const updateType = (id: string, type: string) => setWidgets((prev: any[]) => prev.map((w) => (w.id === id ? { ...w, type } : w)))

  return (
    <div className="w-full space-y-4 overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider">Métricas Personalizadas</h2>
        <div className="flex items-center gap-2">
          <DatePicker
            mode="range"
            variant="button"
            value={dateRange}
            onChange={setDateRange}
            placeholder="Filtrar por Fecha"
            iconSize={18}
          />
          <SmartModal trigger={<SmartButton icon={Plus} label="Agregar Metric Card" variant="outline" size="sm" />}>
            {({ close }) => (
              <div className="space-y-4">
                <h3 className="font-bold text-base">Crear tarjeta personalizada</h3>
                <FormGroup
                  fields={[
                    { name: 'title', label: 'Título del Widget', required: true },
                    { name: 'tableName', label: 'Tabla / Módulo', type: 'select', options: TABLES_OPTIONS },
                    {
                      name: 'type',
                      label: 'Vista Inicial',
                      type: 'select',
                      options: [
                        { label: 'Número Directo', value: 'counter' },
                        { label: 'Gráfico de Barras', value: 'bar' },
                        { label: 'Gráfico de Líneas', value: 'line' },
                      ],
                    },
                  ]}
                  values={form}
                  onChange={(name, value) => setForm((p) => ({ ...p, [name]: value }))}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <SmartButton label="Guardar Card" onClick={() => addWidget(close)} />
                </div>
              </div>
            )}
          </SmartModal>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {widgets.map((widget: any) => (
          <WidgetCard
            key={widget.id}
            widget={widget}
            initialCount={counts[widget.tableName] ?? 0}
            dateRange={dateRange}
            onUpdateType={updateType}
            onRemove={removeWidget}
          />
        ))}
      </div>
    </div>
  )
}