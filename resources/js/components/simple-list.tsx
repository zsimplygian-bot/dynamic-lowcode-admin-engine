import { useState, useMemo, ReactNode } from 'react';
import { Database } from 'lucide-react';
import { NewRecordButton } from '@/components/new-record-button';
import { ActionButtons } from '@/components/action-buttons';
import { SmartBadge } from '@/components/smart-badge';
import { SearchInput } from '@/components/search-input';
import type { FieldConfig } from '@/components/form-group';
interface SimpleListProps<T extends { id: string | number }> {
  title?: string;
  items: T[];
  searchKey: keyof T | ((item: T) => string);
  endpoint: string;
  fields: readonly FieldConfig[] | FieldConfig[];
  renderRowContent?: (item: T) => ReactNode;
  emptyText?: string;
  maxHeight?: string;
}
export function SimpleList<T extends { id: string | number }>({ title = 'registro', items = [], searchKey, endpoint, fields, renderRowContent, emptyText, maxHeight = '400px',
}: SimpleListProps<T>) {
  const [query, setQuery] = useState('');
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const val = typeof searchKey === 'function' ? searchKey(item) : String(item[searchKey] ?? '');
      return val.toLowerCase().includes(q);
    });
  }, [items, searchKey, query]);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <SearchInput value={query} onChange={setQuery} onClear={() => setQuery('')} />
          <SmartBadge icon={Database} label={`${list.length} de ${items.length}`} variant="secondary" />
        </div>
        <NewRecordButton endpoint={endpoint} fields={fields as FieldConfig[]} />
      </div>
      <div className="border rounded-xl bg-card overflow-hidden divide-y overflow-y-auto" style={{ maxHeight }}>
        {list.length ? (
          list.map((item) => (
            <div key={item.id} className="flex items-center justify-between pl-2 p-1 hover:bg-muted/30 transition-colors">
              <div className="min-w-0 flex-1">
                {renderRowContent ? ( renderRowContent(item) ) : ( <span className="font-mono text-sm font-medium truncate"> {String((item as any)?.name)} </span> )}
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-2">
                <ActionButtons row_id={item.id} endpoint={endpoint} title={title} fields={fields as FieldConfig[]} initialValues={item} />
              </div>
            </div>
          ))
        ) : ( <div className="p-4 text-center text-sm text-muted-foreground"> {query ? `Sin resultados para "${query}".` : (emptyText ?? 'No hay registros.')} </div>
        )}
      </div>
    </div>
  );
}