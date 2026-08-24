import { Link } from '@inertiajs/react';
import { ChevronRight, Pencil } from 'lucide-react';
import { SmartButton } from '@/components/smart-button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup {...{ className: "px-2 py-0" }}>
            <SidebarGroupLabel {...{ className: "flex items-center justify-between w-full" }}>
                <span>Platform</span>
                <SmartButton {...{ href: "/settings/navigation", variant: "ghost", icons: Pencil, size: "sm", tooltip: "Administrar navegación" }} />
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const hasChildren = item.items && item.items.length > 0;

                    if (hasChildren) {
                        const isChildActive = item.items?.some((sub) => sub.href && isCurrentUrl(sub.href));

                        return (
                            <Collapsible {...{ key: item.title, asChild: true, defaultOpen: isChildActive, className: "group/collapsible" }}>
                                <SidebarMenuItem>
                                    <CollapsibleTrigger {...{ asChild: true }}>
                                        <SidebarMenuButton {...{ tooltip: { children: item.title }, isActive: isChildActive }}>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronRight {...{ className: "ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" }} />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items?.map((subItem) => (
                                                <SidebarMenuSubItem {...{ key: subItem.title }}>
                                                    <SidebarMenuSubButton {...{ asChild: true, isActive: Boolean(subItem.href && isCurrentUrl(subItem.href)) }}>
                                                        {subItem.href ? (
                                                            <Link {...{ href: subItem.href, prefetch: true }}>
                                                                {subItem.icon && <subItem.icon />}
                                                                <span>{subItem.title}</span>
                                                            </Link>
                                                        ) : (
                                                            <div {...{ className: "flex items-center gap-2" }}>
                                                                {subItem.icon && <subItem.icon />}
                                                                <span>{subItem.title}</span>
                                                            </div>
                                                        )}
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    }

                    const isActive = Boolean(item.href && isCurrentUrl(item.href));

                    return (
                        <SidebarMenuItem {...{ key: item.title }}>
                            <SidebarMenuButton {...{ asChild: Boolean(item.href), isActive, tooltip: { children: item.title } }}>
                                {item.href ? (
                                    <Link {...{ href: item.href, prefetch: true }}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                ) : (
                                    <div {...{ className: "flex items-center gap-2 w-full" }}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </div>
                                )}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}