import { Database } from 'lucide-react';
import { NewRecordButton } from '@/components/new-record-button';
import { ActionButtons } from '@/components/action-buttons';
import { SmartBadge } from '@/components/smart-badge';
import { SearchInput } from '@/components/search-input';

export function SimpleList({ title = 'registro', items = [], searchKey, subtitleKey, endpoint, fields, icon: DefaultIcon, renderRowContent, renderExtra, maxHeight = '400px' }) {
    return (
        <SearchInput items={items} searchKey={searchKey} listClassName="border rounded-xl bg-card overflow-hidden divide-y overflow-y-auto" listStyle={{ maxHeight }}
            actions={({ filtered }) => (
                <>
                    <SmartBadge icon={Database} label={`${filtered.length} de ${items.length}`} variant="secondary" />
                    <NewRecordButton endpoint={endpoint} fields={fields} />
                </>
            )}
        >
            {(item) => {
                const iconProp = item?.icon ?? DefaultIcon;
                const IconComponent = typeof iconProp === 'function' ? iconProp(item) : iconProp;
                const subtitle = typeof subtitleKey === 'function' ? subtitleKey(item) : item?.[subtitleKey];

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
                                        <p className="text-sm font-medium truncate">{String(item?.name ?? '')}</p>
                                        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                            {renderExtra && (
                                <div className="flex items-center gap-2 shrink-0">
                                    {renderExtra(item)}
                                </div>
                            )}
                            <ActionButtons row_id={item.id} endpoint={endpoint} title={title} fields={fields} initialValues={item} />
                        </div>
                    </div>
                );
            }}
        </SearchInput>
    );
}

export default SimpleList;