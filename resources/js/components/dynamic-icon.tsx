import { lazy, Suspense, ComponentType } from 'react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import { LucideProps } from 'lucide-react';

const cache = new Map<string, ComponentType<LucideProps>>();

export function DynamicIcon({ name, ...props }: { name: string } & LucideProps) {
    const iconName = (name in dynamicIconImports ? name : 'help-circle') as keyof typeof dynamicIconImports;
    if (!cache.has(iconName)) cache.set(iconName, lazy(dynamicIconImports[iconName]));
    const Icon = cache.get(iconName)!;

    return (
        <Suspense fallback={<div className="size-4 animate-pulse rounded bg-muted" />}>
            <Icon {...props} />
        </Suspense>
    );
}