import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type BadgeColor = 'amber' | 'blue' | 'green' | 'rose' | 'purple' | 'emerald' | 'cyan' | 'slate';

const COLOR_CLASSES: Record<BadgeColor, string> = {
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  green: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
};

interface SmartBadgeProps {
  label?: string | number;
  icon?: LucideIcon;
  color?: BadgeColor;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  children?: ReactNode;
}

export function SmartBadge({
  label,
  icon: Icon,
  color,
  variant = 'secondary',
  className,
  children,
}: SmartBadgeProps) {
  return (
    <Badge variant={color ? 'outline' : variant} className={cn(color && COLOR_CLASSES[color], className)}>
      {Icon && <Icon className="size-3.5" />}
      {label}
      {children}
    </Badge>
  );
}