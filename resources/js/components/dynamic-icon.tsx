import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
    name?: string;
}

// Mapa auxiliar en memoria para resolver nombres en kebab-case o minúsculas al nombre exacto de Lucide
const iconNameMap = new Map<string, string>();

Object.keys(Icons).forEach((key) => {
    // Guarda variantes en minúsculas y sin guiones para tolerar 'paw-print', 'pawprint' o 'PawPrint'
    iconNameMap.set(key.toLowerCase(), key);
    iconNameMap.set(key.toLowerCase().replace(/-/g, ''), key);
});

export function DynamicIcon({ name = 'LayoutGrid', ...props }: DynamicIconProps) {
    const iconsRecord = Icons as unknown as Record<string, React.ComponentType<LucideProps>>;

    // 1. Intento directo por nombre exacto (ej. "PawPrint", "LayoutGrid")
    let resolvedName = name;

    // 2. Si no coincide directo, busca coincidencia tolerante a minúsculas / kebab-case (ej. "paw-print" -> "PawPrint")
    if (!iconsRecord[resolvedName]) {
        const normalized = name.toLowerCase();
        resolvedName = iconNameMap.get(normalized) || iconNameMap.get(normalized.replace(/-/g, '')) || 'LayoutGrid';
    }

    const IconComponent = iconsRecord[resolvedName] || Icons.LayoutGrid;

    return <IconComponent {...props} />;
}