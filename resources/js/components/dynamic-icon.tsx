import { lazy, memo, Suspense } from 'react';
import type { LucideProps } from 'lucide-react';
import { LayoutGrid } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
    name?: string;
}

// Cache global en memoria para almacenar los componentes lazy ya creados
const iconCache = new Map<string, React.LazyExoticComponent<React.ComponentType<LucideProps>>>();

function getLazyIcon(name: string) {
    if (!iconCache.has(name)) {
        const LazyComponent = lazy(() =>
            import('lucide-react')
                .then((module) => ({
                    default: (module as Record<string, React.ComponentType<LucideProps>>)[name] || LayoutGrid,
                }))
                .catch(() => ({ default: LayoutGrid }))
        );
        iconCache.set(name, LazyComponent);
    }
    return iconCache.get(name)!;
}

export const DynamicIcon = memo(function DynamicIcon({ name = 'LayoutGrid', ...props }: DynamicIconProps) {
    const IconComponent = getLazyIcon(name);

    return (
        <Suspense {...{ fallback: <LayoutGrid {...props} /> }}>
            <IconComponent {...props} />
        </Suspense>
    );
});