import { useState } from 'react';
import { Database } from 'lucide-react';
import { NewRecordButton } from '@/components/new-record-button';
import { ActionButtons } from '@/components/action-buttons';
import { SmartBadge } from '@/components/smart-badge';
import { SearchInput, SearchEmpty } from '@/components/search-input';

export function SimpleList({ title = 'registro', items, searchKey = 'name', subtitleKey, endpoint, fields, icon: DefaultIcon, renderRowContent, renderExtra, maxHeight = '400px' }) {
    const [{ filtered, query }, setSearchState] = useState({ filtered: items ?? [], query: '' });

    return (
        <div className="w-full flex flex-col gap-2">
            <div className="flex items-center gap-2 w-full">
                <SearchInput items={items} searchKey={searchKey} onFilter={setSearchState} />
                <SmartBadge icon={Database} label={`${filtered.length} de ${items?.length ?? 0}`} variant="secondary" />
                <NewRecordButton endpoint={endpoint} fields={fields} />
            </div>
            <div className="border rounded-xl bg-card overflow-hidden divide-y overflow-y-auto space-y-0.5" style={{ maxHeight }}>
                {filtered.length === 0 ? (
                    <SearchEmpty query={query} />
                ) : (
                    filtered.map((item) => {
                        const rawIcon = item?.icon ?? DefaultIcon;
                        const IconComponent = typeof rawIcon === 'function' ? rawIcon(item) : rawIcon;
                        const subtitle = typeof subtitleKey === 'function' ? subtitleKey(item) : (subtitleKey ? item?.[subtitleKey] : null);

                        return (
                            <div key={item.id} className="flex items-center justify-between pl-2 p-1 hover:bg-muted/30 transition-colors">
                                <div className="min-w-0 flex-1">
                                    {renderRowContent ? renderRowContent(item) : (
                                        <div className="flex items-center gap-2 min-w-0">
                                            {IconComponent && (
                                                <div className="p-2 border rounded-lg bg-muted text-muted-foreground shrink-0">
                                                    <IconComponent className="size-5" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{item?.name}</p>
                                                {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                    {renderExtra?.(item)}
                                    <ActionButtons row_id={item.id} endpoint={endpoint} title={title} fields={fields} initialValues={item} />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default SimpleList;