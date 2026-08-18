import { forwardRef, type InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SmartButton } from '@/components/smart-button';
export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value?: string;
    onChange?: (value: string) => void;
    onClear?: () => void;
    wrapperClassName?: string;
}
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
    ({ value = '', onChange, onClear, className = '', wrapperClassName = '', placeholder = 'Buscar...', ...props }, ref) => {
        return (
            <div {...{ className: `relative flex items-center w-full max-w-sm ${wrapperClassName}` }}>
                <Search {...{ className: "absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" }} />
                <Input {...{ ref, type: "text", placeholder, value, onChange: (e) => onChange?.(e.target.value),
                    className: `pl-8 ${value ? 'pr-8' : ''} ${className}`, ...props }} />
                {Boolean(value) && (
                    <div {...{ className: "absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center" }}>
                        <SmartButton {...{ icons: X, size: "xs", variant: "ghost", tooltip: "Limpiar", className: "text-muted-foreground hover:text-foreground",
                            onClick: () => { onChange?.(''); onClear?.(); } }} />
                    </div>
                )}
            </div>
        );
    }
);
SearchInput.displayName = 'SearchInput';