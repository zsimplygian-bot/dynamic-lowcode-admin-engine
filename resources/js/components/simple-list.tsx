import { useState } from 'react';
import { NewRecordButton } from '@/components/new-record-button';
import { ActionButtons } from '@/components/action-buttons';
import { SmartBadge } from '@/components/smart-badge';
import { SearchInput, SearchEmpty } from '@/components/search-input';
import { DynamicIcon } from '@/components/dynamic-icon';
export function SimpleList({ title = 'registro', items = [], searchKey = 'name', subtitle = 'subtitle', colorKey = 'color', endpoint = '', fields = [], icon: DefaultIcon = 'table', renderExtra, maxHeight = '400px' }: { 
    title?: string; items?: any[]; searchKey?: string; subtitle?: string; colorKey?: string; endpoint?: string; fields?: any[]; icon?: string; renderExtra?: any; maxHeight?: string }) {
    const [{ filtered, query }, setSearchState] = useState({ filtered: items, query: '' });
    return (
        <div className="w-full flex flex-col gap-2">
            <div className="flex items-center gap-2 w-full">
                <SearchInput items={items} searchKey={searchKey} onFilter={setSearchState} />
                <SmartBadge icon="database" label={`${filtered.length} de ${items.length}`} variant="secondary" />
                <NewRecordButton endpoint={endpoint} fields={fields} />
            </div>
            <div className="border rounded-xl bg-card overflow-hidden divide-y overflow-y-auto" style={{ maxHeight }}>
                {filtered.length === 0 ? <SearchEmpty query={query} /> : filtered.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-2 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className={`p-2 border rounded-lg flex items-center justify-center ${item?.[colorKey] || 'bg-muted text-muted-foreground'}`}>
                                <DynamicIcon name={item?.icon ?? DefaultIcon} className="size-5"/>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{item?.name}</p>
                                {item?.[subtitle] && <p className="text-xs text-muted-foreground truncate">{item[subtitle]}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {renderExtra?.(item)} <ActionButtons row_id={item.name} endpoint={endpoint} title={title} fields={fields} initialValues={item}/></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
export default SimpleList;