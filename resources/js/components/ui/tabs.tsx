import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { DynamicIcon } from '@/components/dynamic-icon';
export interface TabItem<T extends string = string> {
    id: T;
    label: string;
    icon?: string;
}
export interface TabsProps<T extends string = string> {
    tabs: TabItem<T>[];
    className?: string;
    children: (activeTab: T) => ReactNode;
}
export function Tabs<T extends string = string>({ tabs, className = '', children }: TabsProps<T>) {
    const [activeTab, setActiveTab] = useState<T>(tabs[0]?.id);
    return (
        <div className="space-y-2">
            <div className={`flex border rounded-lg p-1 bg-muted/50 max-w-xs text-xs font-medium ${className}`}>
                {tabs.map(({ id, label, icon }) => {
                    const isActive = activeTab === id;
                    return (
                        <Button {...{ key: id, type: "button", variant: isActive ? "secondary" : "ghost", size: "sm", onClick: () => setActiveTab(id), 
                        className: `flex-1 h-8 gap-2 ${isActive ? 'shadow-sm' : 'text-muted-foreground'}` }}>
                            {icon && <DynamicIcon name={icon} className="size-5" />} {label}
                        </Button>
                    );
                })}
            </div>
            {children(activeTab)}
        </div>
    );
}