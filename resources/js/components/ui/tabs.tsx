import { ComponentType } from 'react';
import { Button } from '@/components/ui/button';

export interface TabItem<T extends string = string> {
    id: T;
    label: string;
    icon?: ComponentType<{ className?: string }>;
}

export interface TabsProps<T extends string = string> {
    activeTab: T;
    onTabChange: (id: T) => void;
    tabs: TabItem<T>[];
    className?: string;
}

export function Tabs<T extends string = string>({ activeTab, onTabChange, tabs, className = '' }: TabsProps<T>) {
    return (
        <div className={`flex border rounded-lg p-1 bg-muted/50 max-w-xs text-xs font-medium ${className}`}>
            {tabs.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                return (
                    <Button {...{ key: id, type: "button", variant: isActive ? "secondary" : "ghost", size: "sm", onClick: () => onTabChange(id), className: `flex-1 h-8 gap-2 ${isActive ? 'shadow-sm' : 'text-muted-foreground'}` }}>
                        {Icon && <Icon {...{ className: "size-3.5" }} />}
                        {label}
                    </Button>
                );
            })}
        </div>
    );
}