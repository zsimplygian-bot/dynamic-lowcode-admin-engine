import { useState, useMemo, memo, ReactNode } from 'react';
import { Search, Database } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Heading from '@/components/heading';
import { NewRecordButton } from '@/components/new-record-button';
import { ActionButtons } from '@/components/action-buttons';
import { SmartBadge } from '@/components/smart-badge';
export interface FieldConfig {
    name: string;
    label: string;
    placeholder?: string;
    required?: boolean;
}
interface SimpleListProps<T extends { id: string | number }> {
    title?: string;
    description?: string;
    items: T[];
    searchKey: keyof T;
    endpoint: string;
    fields: FieldConfig[];
    renderRowContent: (item: T) => ReactNode;
    emptyText?: string;
    maxHeight?: string;
}
function SimpleListUnmemoized<T extends { id: string | number }>({
    title, description, items = [], searchKey, endpoint, fields, renderRowContent, emptyText, maxHeight = '400px'
}: SimpleListProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');
    const filteredItems = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return items;
        return items.filter((item) => String(item[searchKey] ?? '').toLowerCase().includes(query));
    }, [items, searchKey, searchQuery]);
    const entityTitle = title ?? 'registro';
    return (
        <div className="max-w-4xl mx-auto space-y-4">
            {title && (
                <Heading {...{ variant: 'small', title, description }} />
            )}
            <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input {...{ type: 'text', placeholder: `Buscar...`, value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: 'pl-9 h-9' }} />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <SmartBadge {...{ icon: Database, label: `${filteredItems.length} de ${items.length} registros`, variant: "secondary" }} />
                    <NewRecordButton {...{ endpoint, fields }} />
                </div>
            </div>
            <div className="border rounded-xl bg-card overflow-hidden">
                <div className="divide-y overflow-y-auto" style={{ maxHeight }}>
                    {filteredItems.length === 0 ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                            {searchQuery ? `No se encontraron resultados para "${searchQuery}".` : (emptyText ?? 'No hay registros disponibles.')}
                        </div>
                    ) : (
                        filteredItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-2 hover:bg-muted/30 transition-colors">
                                <div className="min-w-0 flex-1">{renderRowContent(item)}</div>
                                <div className="flex items-center gap-3 shrink-0 ml-2">
                                    <ActionButtons {...{ row_id: item.id, endpoint, title: entityTitle, fields, initialValues: item }} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
export const SimpleList = memo(SimpleListUnmemoized) as typeof SimpleListUnmemoized;