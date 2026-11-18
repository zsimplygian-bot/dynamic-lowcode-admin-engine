import { lazy, Suspense, ComponentType } from 'react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';
const cache = new Map<string, ComponentType<LucideProps>>();
export function DynamicIcon({ name, className, ...props }: { name: string } & LucideProps) {
  const iconName = (name in dynamicIconImports ? name : 'help-circle') as keyof typeof dynamicIconImports;
  if (!cache.has(iconName)) cache.set(iconName, lazy(dynamicIconImports[iconName]));
  const Icon = cache.get(iconName)!;
  return (
    <Suspense fallback={<div className="size-5 animate-pulse rounded bg-muted" />}>
      <Icon className={cn("size-5", className)} {...props} />
    </Suspense>
  );
}