import { useState } from 'react';
import { Plus, Trash2, BarChart2, Hash, TrendingUp } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { SmartButton } from '@/components/smart-button';
import { SmartModal } from '@/components/smart-modal';
import { FormGroup } from '@/components/form-group';

const TABLES_OPTIONS = [
    { label: 'Cliente', value: 'cliente' },
    { label: 'Mascota', value: 'mascota' },
    { label: 'Cita', value: 'cita' },
    { label: 'Historia Clínica', value: 'historia' },
    { label: 'Producto', value: 'producto' },
    { label: 'Procedimiento', value: 'procedimiento' },
];

const DEFAULT_WIDGETS = [
    { id: '1', title: 'Total Citas', tableName: 'cita', type: 'counter' },
    { id: '2', title: 'Mascotas Activas', tableName: 'mascota', type: 'bar' },
];

export default function CustomDashboardWidgets({ counts = {} }) {
    const [widgets, setWidgets] = useLocalStorage('custom_dashboard_widgets', DEFAULT_WIDGETS);
    const [form, setForm] = useState({ title: '', tableName: 'cliente', type: 'counter' });

    const addWidget = (closeModal) => {
        if (!form.title) return;
        setWidgets((prev) => [...prev, { ...form, id: crypto.randomUUID() }]);
        setForm({ title: '', tableName: 'cliente', type: 'counter' });
        closeModal();
    };

    const removeWidget = (id) => setWidgets((prev) => prev.filter((w) => w.id !== id));
    
    const updateType = (id, type) => setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, type } : w)));

    return (
        <div className="w-full space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase">MÉTRICAS PERSONALIZADAS</h2>
                <SmartModal trigger={<SmartButton icon={Plus} label="Agregar Metric Card" variant="outline" size="sm" />}>
                    {({ close }) => (
                        <div className="p-4 space-y-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {widgets.map((widget) => {
                    const count = counts[widget.tableName] ?? 0;
                    return (
                        <div key={widget.id} className="flex flex-col justify-between rounded-xl border bg-card p-4 shadow-xs gap-3">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase truncate">{widget.title}</span>
                                <div className="flex items-center gap-1">
                                    <SmartButton icon={Hash} variant={widget.type === 'counter' ? 'default' : 'ghost'} size="xs" onClick={() => updateType(widget.id, 'counter')} tooltip="Contador" />
                                    <SmartButton icon={BarChart2} variant={widget.type === 'bar' ? 'default' : 'ghost'} size="xs" onClick={() => updateType(widget.id, 'bar')} tooltip="Barras" />
                                    <SmartButton icon={TrendingUp} variant={widget.type === 'line' ? 'default' : 'ghost'} size="xs" onClick={() => updateType(widget.id, 'line')} tooltip="Tendencia" />
                                    <SmartButton icon={Trash2} variant="ghost" size="xs" className="text-red-500 hover:text-red-600" onClick={() => removeWidget(widget.id)} tooltip="Eliminar" />
                                </div>
                            </div>

                            <div className="flex items-center justify-center min-h-[80px]">
                                {widget.type === 'counter' && <span className="text-4xl font-extrabold">{count}</span>}
                                {widget.type === 'bar' && (
                                    <div className="flex items-end gap-1.5 h-16 w-full justify-center pt-2">
                                        <div className="w-1/5 bg-primary/30 rounded-t h-[40%]" />
                                        <div className="w-1/5 bg-primary/60 rounded-t h-[70%]" />
                                        <div className="w-1/5 bg-primary rounded-t h-[100%]" />
                                    </div>
                                )}
                                {widget.type === 'line' && (
                                    <div className="flex items-center justify-center w-full h-16 text-xs text-muted-foreground italic">
                                        Tendencia ({count})
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}