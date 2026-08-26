import { memo } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, Pencil } from 'lucide-react';
import { DynamicIcon } from '@/components/dynamic-icon';
import { SmartButton } from '@/components/smart-button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';
type ExtendedNavItem = NavItem & { iconName?: string };
const NavLink = memo(function NavLink({ item, isCurrentUrl, ButtonComponent }: { item: ExtendedNavItem; isCurrentUrl: (href: string) => boolean; ButtonComponent: any }) {
    const isActive = Boolean(item.href && isCurrentUrl(item.href));
    const IconComponent = item.icon;
    const renderIcon = () => {
        if (item.iconName) return <DynamicIcon {...{ name: item.iconName, className: "size-4 shrink-0" }} />;
        if (IconComponent) return <IconComponent {...{ className: "size-4 shrink-0" }} />;
        return null;
    };
    return (
        <ButtonComponent {...{ asChild: Boolean(item.href), isActive, tooltip: item.items ? undefined : { children: item.title }, className: "w-full pr-2" }}>
            {item.href ? (
                <Link {...{ href: item.href, prefetch: true, className: "flex items-center gap-2 w-full min-w-0" }}>
                    {renderIcon()} <span {...{ className: "truncate" }}>{item.title}</span>
                </Link>
            ) : (
                <div {...{ className: "flex items-center gap-2 w-full min-w-0" }}> {renderIcon()} <span {...{ className: "truncate" }}>{item.title}</span>
                </div>
            )}
        </ButtonComponent>
    );
});
const MenuItem = memo(function MenuItem({ item, isCurrentUrl }: { item: ExtendedNavItem; isCurrentUrl: (href: string) => boolean }) {
    if (item.items?.length) {
        const isChildActive = item.items.some((sub) => sub.href && isCurrentUrl(sub.href));
        return (
            <Collapsible {...{ asChild: true, defaultOpen: isChildActive, className: "group/collapsible" }}>
                <SidebarMenuItem>
                    <CollapsibleTrigger {...{ asChild: true }}>
                        <SidebarMenuButton {...{ tooltip: { children: item.title }, isActive: isChildActive, className: "pr-2" }}>
                            {item.iconName ? <DynamicIcon {...{ name: item.iconName, className: "size-4 shrink-0" }} /> : item.icon && <item.icon {...{ className: "size-4 shrink-0" }} />}
                            <span {...{ className: "truncate" }}>{item.title}</span>
                            <ChevronRight {...{ className: "ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" }} />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub {...{ className: "mr-0 pr-0" }}>
                            {item.items.map((sub: ExtendedNavItem) => (
                                <SidebarMenuSubItem {...{ key: sub.title, className: "pr-0" }}>
                                    <NavLink {...{ item: sub, isCurrentUrl, ButtonComponent: SidebarMenuSubButton }} />
                                </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
            </Collapsible>
        );
    }
    return ( <SidebarMenuItem> <NavLink {...{ item, isCurrentUrl, ButtonComponent: SidebarMenuButton }} /> </SidebarMenuItem> );
});
export function NavMain({ items = [] }: { items: ExtendedNavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    return (
        <SidebarGroup {...{ className: "px-2 py-0" }}>
            <SidebarGroupLabel {...{ className: "flex items-center justify-between w-full" }}>
                <span>Platform</span>
                <SmartButton {...{ href: "/settings/navigation", variant: "ghost", icon: Pencil, size: "xs", tooltip: "Administrar navegación" }} />
            </SidebarGroupLabel>
            <SidebarMenu> {items.map((item) => ( <MenuItem {...{ key: item.title, item, isCurrentUrl }} /> ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}