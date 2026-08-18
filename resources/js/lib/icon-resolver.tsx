import * as Icons from 'lucide-react';
import { LucideProps } from 'lucide-react';

export function DynamicIcon({ name, ...props }: { name?: string } & LucideProps) {
    if (!name) return null;

    const IconComponent = (Icons as Record<string, React.ComponentType<LucideProps>>)[name];

    if (!IconComponent) {
        return <Icons.Circle className={props.className || 'size-4'} />;
    }

    return <IconComponent {...props} />;
}