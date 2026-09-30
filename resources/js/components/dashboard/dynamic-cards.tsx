import { NewRecordButton } from '@/components/new-record-button';
import { SmartButton } from '@/components/smart-button';
import { DynamicIcon } from '@/components/dynamic-icon';
import { useLocalStorage } from '@/hooks/use-local-storage';
type CardItem = { name: string; label: string; icon: string; color: string; rows_count: number; isPrimary?: boolean; };
const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
function DynamicCard({ item }: { item: CardItem }) {
    const displayLabel = capitalize(item.label || item.name);
    return (
        <div className={`flex items-center justify-between gap-2 rounded-4xl border transition-all ${item.isPrimary ? 'p-4' : 'p-3'}`}>
            <div className="flex flex-1 flex-col items-center justify-center gap-1 min-w-0">
                <div className="flex items-center justify-center gap-2">
                    <div className={`flex shrink-0 items-center justify-center rounded-full ${item.color ?? 'bg-primary'} ${item.isPrimary ? 'size-14' : 'size-10'}`}>
                        <DynamicIcon name={item.icon ?? 'table'} className={`text-white ${item.isPrimary ? 'size-7' : 'size-5'}`} />
                    </div>
                    <span className={`font-bold ${item.isPrimary ? 'text-3xl' : 'text-2xl'}`}>{item.rows_count ?? 0}</span>
                </div>
                <div className={`text-center font-semibold opacity-75 truncate w-full ${item.isPrimary ? 'text-sm' : 'text-xs'}`}>{displayLabel}</div>
            </div>
            <div className="flex shrink-0 flex-col gap-1">
                <NewRecordButton tableName={item.name} />
                <SmartButton href={`/table/${item.name}`} icon="external-link" variant="outline" tooltip="Ir a lista" />
            </div>
        </div>
    );
}
export default function DynamicCards({ cards = [] }: { cards?: CardItem[] }) {
    const [isOpen, setIsOpen] = useLocalStorage('dynamic_cards_is_open', true);
    const renderGrid = (items: CardItem[], gridClasses: string) => (
        <div className={`grid gap-3 ${gridClasses}`}>
            {items.map((item) => <DynamicCard key={item.name} item={item} />)}
        </div>
    );
    return (
        <div className="w-full rounded-2xl">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase">REGISTROS ACTUALES</h2>
                <SmartButton onClick={() => setIsOpen((prev) => !prev)} icon={isOpen ? "chevron-up" : "chevron-down"} variant="ghost" />
            </div>
            <div className="flex flex-col gap-4 pt-2">
                {renderGrid(cards.filter((c) => c.isPrimary), "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4")}
                {isOpen && renderGrid(cards.filter((c) => !c.isPrimary), "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7")}
            </div>
        </div>
    );
}