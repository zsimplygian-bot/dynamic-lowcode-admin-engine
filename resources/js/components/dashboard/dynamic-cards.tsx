import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { NewRecordButton } from '@/components/new-record-button';
import { SmartButton } from '@/components/smart-button';
import { DynamicIcon } from '@/components/dynamic-icon';
import { useLocalStorage } from '@/hooks/use-local-storage';
const ENTITIES_SCHEMA = [
    { key: 'cliente', label: 'Cliente', color: 'bg-rose-500', icon: 'Users', isPrimary: true },
    { key: 'mascota', label: 'Mascota', color: 'bg-emerald-500', icon: 'PawPrint', isPrimary: true },
    { key: 'cita', label: 'Cita', color: 'bg-blue-500', icon: 'Calendar', isPrimary: true },
    { key: 'historia', label: 'Historias Clínicas', color: 'bg-amber-500', icon: 'ClipboardList', isPrimary: true },
    { key: 'producto', label: 'Producto', color: 'bg-purple-500', icon: 'Syringe' },
    { key: 'procedimiento', label: 'Procedimiento', color: 'bg-indigo-500', icon: 'Stethoscope' },
    { key: 'categoria_producto', label: 'Categoria producto', color: 'bg-pink-500', icon: 'Tag' },
    { key: 'categoria_procedimiento', label: 'Categoria procedimiento', color: 'bg-teal-500', icon: 'Tags' },
    { key: 'especie', label: 'Especie', color: 'bg-orange-500', icon: 'Sparkles' },
    { key: 'raza', label: 'Raza', color: 'bg-cyan-500', icon: 'Dna' },
    { key: 'motivo', label: 'Motivo', color: 'bg-lime-500', icon: 'FileText' }
];
function DynamicCard({ label, count, icon, colorClass, tableName, isPrimary }) {
    return (
        <div className={`flex items-center justify-between gap-2 rounded-4xl border transition-all ${isPrimary ? 'p-4' : 'p-3'}`}>
            <div className="flex flex-1 flex-col items-center justify-center gap-1 min-w-0">
                <div className="flex items-center justify-center gap-2">
                    <div className={`flex shrink-0 items-center justify-center rounded-full ${colorClass} ${isPrimary ? 'size-14' : 'size-10'}`}>
                        <DynamicIcon {...{ name: icon, className: `text-white ${isPrimary ? 'size-7' : 'size-5'}` }} />
                    </div>
                    <span className={`font-bold ${isPrimary ? 'text-3xl' : 'text-2xl'}`}>{count ?? 0}</span>
                </div>
                <div className={`text-center font-semibold opacity-75 truncate w-full ${isPrimary ? 'text-sm' : 'text-xs'}`}>{label}</div>
            </div>
            <div className="flex shrink-0 flex-col gap-1">
                <NewRecordButton {...{ tableName }} />
                <SmartButton {...{ href: `/table/${tableName}`, icon: ExternalLink, variant: 'outline', tooltip: 'Ir a lista' }} />
            </div>
        </div>
    );
}
export default function DynamicCards({ counts = {} }) {
    const [isOpen, setIsOpen] = useLocalStorage('dynamic_cards_is_open', true);
    const renderGrid = (items, gridClasses) => (
        <div className={`grid gap-3 ${gridClasses}`}>
            {items.map((item) => (
                <DynamicCard key={item.key} {...{ label: item.label, count: counts?.[item.key], icon: item.icon, colorClass: item.color, tableName: item.key, isPrimary: item.isPrimary }} />
            ))}
        </div>
    );
    return (
        <div className="w-full rounded-2xl">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase">REGISTROS ACTUALES</h2>
                <SmartButton {...{ onClick: () => setIsOpen((prev) => !prev), icon: isOpen ? ChevronUp : ChevronDown, variant: 'ghost' }} />
            </div>
            <div className="flex flex-col gap-4 pt-2">
                {renderGrid(ENTITIES_SCHEMA.filter(i => i.isPrimary), "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4")}
                {isOpen && renderGrid(ENTITIES_SCHEMA.filter(i => !i.isPrimary), "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7")}
            </div>
        </div>
    );
}