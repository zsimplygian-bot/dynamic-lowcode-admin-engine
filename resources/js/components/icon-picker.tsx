import { useState } from 'react';
import * as Icons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { DynamicIcon } from '@/lib/icon-resolver';

// Lista seleccionada de iconos comunes de Lucide para evitar saturar la interfaz
const POPULAR_ICONS = [
    'LayoutGrid', 'Folder', 'FileText', 'Users', 'Settings', 'Home', 
    'BookOpen', 'ShoppingBag', 'CreditCard', 'BarChart2', 'Database', 
    'Mail', 'Bell', 'Calendar', 'Shield', 'Layers', 'Tag', 'Globe', 'HelpCircle'
];

interface IconPickerProps {
    value?: string;
    onChange: (iconName: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filteredIcons = POPULAR_ICONS.filter((name) =>
        name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start space-x-2">
                    {value ? (
                        <>
                            <DynamicIcon name={value} className="size-4" />
                            <span>{value}</span>
                        </>
                    ) : (
                        <span className="text-muted-foreground">Seleccionar icono...</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="start">
                <Input
                    placeholder="Buscar icono..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mb-3 h-8 text-xs"
                />
                <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                    {filteredIcons.map((iconName) => (
                        <Button
                            key={iconName}
                            type="button"
                            variant={value === iconName ? 'default' : 'outline'}
                            className="p-2 h-9 w-9 flex items-center justify-center"
                            onClick={() => {
                                onChange(iconName);
                                setOpen(false);
                            }}
                        >
                            <DynamicIcon name={iconName} className="size-4" />
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}