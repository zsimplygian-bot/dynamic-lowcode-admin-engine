import { forwardRef, useState, useMemo, KeyboardEvent, type InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SmartButton } from '@/components/smart-button';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
export interface SearchInputProps<T> extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'children'> {
    items?: T[];
    searchKey?: keyof T | ((item: T) => string);
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onClear?: () => void;
    onSearchSubmit?: (value: string) => void;
    filterOnEnter?: boolean;
    children?: (props: { filteredItems: T[]; resetSearch: () => void; search: string }) => React.ReactNode;
}
const EMPTY_ITEMS: any[] = []; // Referencia estática para no invalidar el useMemo
const getItemValue = <T,>(item: T, searchKey?: keyof T | ((item: T) => string)): string => {
    if (typeof searchKey === 'function') return searchKey(item);
    if (searchKey) return String(item[searchKey] ?? '');
    return String((item as any)?.label ?? (item as any)?.name ?? '');
};
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps<any>>(
    ({ items = EMPTY_ITEMS, searchKey, value: valueProp, defaultValue = '', onChange, onClear, onSearchSubmit, filterOnEnter = false, placeholder, className, children, ...props }, ref) => {
        const t = useTranslation();
        const [search, setSearch] = useState(valueProp ?? defaultValue);
        const currentVal = valueProp !== undefined ? valueProp : search;
        const handleUpdate = (val: string) => {
            if (valueProp === undefined) setSearch(val);
            onChange?.(val);
            if (!filterOnEnter) onSearchSubmit?.(val);
        };
        const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
            if (filterOnEnter && e.key === 'Enter') {
                e.preventDefault();
                onSearchSubmit?.(currentVal);
            }
        };
        const handleClear = () => {
            handleUpdate('');
            onClear?.();
            if (filterOnEnter) onSearchSubmit?.('');
        };
        const filteredItems = useMemo(() => {
            const q = currentVal.trim().toLowerCase();
            if (!q || !items.length) return items;
            return items.filter((item) => getItemValue(item, searchKey).toLowerCase().includes(q));
        }, [items, currentVal, searchKey]);
        return (
            <div className="w-full flex flex-col gap-1">
                <div className="relative flex items-center w-full">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none z-10 shrink-0" />
                    <Input ref={ref} type="text" placeholder={placeholder ?? t("Search...")} value={currentVal} onChange={(e) => handleUpdate(e.target.value)} onKeyDown={handleKeyDown}
                        className={cn("pl-9 pr-9", className)} {...props} />
                    {Boolean(currentVal) && (
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center z-10">
                            <SmartButton icon={X} size="xs" variant="ghost" tooltip={t("Clear")} onClick={handleClear} />
                        </div>
                    )}
                </div>
                {children?.({ filteredItems, resetSearch: handleClear, search: currentVal })}
            </div>
        );
    }
);
SearchInput.displayName = 'SearchInput';