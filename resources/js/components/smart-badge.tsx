import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
interface SmartBadgeProps {
    label?: string | number;
    icon?: LucideIcon;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
    children?: ReactNode;
}
export function SmartBadge({
    label,
    icon: Icon,
    variant = 'secondary',
    className,
    children,
}: SmartBadgeProps) {
    return (
        <Badge {...{ variant, className }}>
            {Icon && <Icon {...{ className: "size-3.5" }} />}
            {label}
            {children}
        </Badge>
    );
}