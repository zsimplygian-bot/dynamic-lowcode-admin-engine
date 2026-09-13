import { type ReactNode } from 'react';
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
  maxHeight?: string;
}
export function SimpleList<T extends { id: string | number }>({ title = 'registro', items = [], searchKey, endpoint, fields, renderRowContent, maxHeight = '400px', }: SimpleListProps<T>) {
  return (
    <SearchInput items={items} searchKey={searchKey} listClassName="border rounded-xl bg-card overflow-hidden divide-y overflow-y-auto" listStyle={{ maxHeight }}
      actions={({ filtered }: any) => (
        <><SmartBadge icon={Database} label={`${filtered.length} de ${items.length}`} variant="secondary" />
          <NewRecordButton endpoint={endpoint} fields={fields as FieldConfig[]} />
        </>
      )}
    >
      {(item: T) => (
        <div key={item.id} className="flex items-center justify-between pl-2 p-1 hover:bg-muted/30 transition-colors">
          <div className="min-w-0 flex-1"> {renderRowContent ? renderRowContent(item) : <span className="font-mono text-sm font-medium truncate">{String((item as any)?.name ?? '')}</span>}
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-2"> <ActionButtons row_id={item.id} endpoint={endpoint} title={title} fields={fields as FieldConfig[]} initialValues={item} />
          </div>
        </div>
      )}
    </SearchInput>
  );
}
export default SimpleList;