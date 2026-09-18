import { memo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, Pencil } from 'lucide-react';
import { DynamicIcon } from '@/components/dynamic-icon';
import { SmartButton } from '@/components/smart-button';
import { SearchInput } from '@/components/search-input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar } from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useTranslation } from '@/hooks/use-translation';
import type { NavItem } from '@/types';

type ExtendedNavItem = NavItem & { iconName?: string };

const NavIcon = memo(function NavIcon({ item }: { item: ExtendedNavItem }) {
    if (item.iconName) return <DynamicIcon name={item.iconName} className="shrink-0" />;
    if (item.icon) return <item.icon className="shrink-0" />;
    return null;
});

const NavLink = memo(function NavLink({ item, isCurrentUrl, ButtonComponent, t }: { item: ExtendedNavItem; isCurrentUrl: (href: string) => boolean; ButtonComponent: any; t: (key: string) => string }) {
    const isActive = Boolean(item.href && isCurrentUrl(item.href));
    return (
        <ButtonComponent asChild={Boolean(item.href)} isActive={isActive} tooltip={item.items ? undefined : { children: t(item.title) }} className="w-full pr-2 [&_svg]:!size-4">
            {item.href ? ( <Link href={item.href} prefetch className="flex items-center gap-2 w-full min-w-0"><NavIcon item={item} /><span className="truncate">{t(item.title)}</span></Link>
            ) : ( <div className="flex items-center gap-2 w-full min-w-0"><NavIcon item={item} /><span className="truncate">{t(item.title)}</span></div>
            )}
        </ButtonComponent>
    );
});

const MenuItem = memo(function MenuItem({ item, isCurrentUrl, t }: { item: ExtendedNavItem; isCurrentUrl: (href: string) => boolean; t: (key: string) => string }) {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    if (item.items?.length) {
        const isChildActive = item.items.some((sub) => sub.href && isCurrentUrl(sub.href));

        if (isCollapsed) {
            return (
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton tooltip={{ children: t(item.title) }} isActive={isChildActive} className="pr-2 [&_svg]:!size-4">
                                <NavIcon item={item} />
                                <span className="truncate">{t(item.title)}</span>
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="start" className="min-w-48 animate-in fade-in-0 zoom-in-95 data-[side=right]:slide-in-from-left-2">
                            {item.items.map((sub) => (
                                <DropdownMenuItem key={sub.title} asChild className="cursor-pointer">
                                    <Link href={sub.href ?? '#'} prefetch className="flex items-center gap-2 w-full">
                                        <NavIcon item={sub} />
                                        <span>{t(sub.title)}</span>
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            );
        }

        return (
            <Collapsible asChild defaultOpen={isChildActive} className="group/collapsible">
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={{ children: t(item.title) }} isActive={isChildActive} className="pr-2 [&_svg]:!size-4">
                            <NavIcon item={item}/> <span className="truncate">{t(item.title)}</span>
                            <ChevronRight className="ml-auto shrink-0 transition-transform duration-200 ease-in-out group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-hidden transition-all duration-200 ease-in-out data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                        <SidebarMenuSub className="mr-0 pr-0">
                            {item.items.map((sub) => (
                                <SidebarMenuSubItem key={sub.title} className="pr-0"><NavLink item={sub} isCurrentUrl={isCurrentUrl} ButtonComponent={SidebarMenuSubButton} t={t}/></SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
            </Collapsible>
        );
    }

    return (<SidebarMenuItem><NavLink item={item} isCurrentUrl={isCurrentUrl} ButtonComponent={SidebarMenuButton} t={t} /></SidebarMenuItem>);
});

const flatten = (items: ExtendedNavItem[]): ExtendedNavItem[] =>
    items.flatMap((i) => [...(i.href ? [i] : []), ...(i.items ? flatten(i.items) : [])]);

export function NavMain({ items = [] }: { items: ExtendedNavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    const t = useTranslation();
    const [search, setSearch] = useState('');
    const filtered = search.trim() ? flatten(items).filter((i) => new RegExp(search, 'i').test(t(i.title))) : null;

    return (
        <SidebarGroup className="px-2 py-0 gap-2">
            <SidebarGroupLabel className="flex items-center justify-between w-full">
                <span>{t('Platform')}</span> <SmartButton href="/settings/navigation" variant="ghost" icon={Pencil} size="xs" tooltip={t('Manage navigation')} />
            </SidebarGroupLabel>
            <SearchInput value={search} onChange={setSearch}/>
            <SidebarMenu className="mt-1">
                {filtered ? filtered.map((item) => (
                    <SidebarMenuItem key={`${item.title}-${item.href}`}><NavLink item={item} isCurrentUrl={isCurrentUrl} ButtonComponent={SidebarMenuButton} t={t}/></SidebarMenuItem> ))
                : items.map((item) => (<MenuItem key={item.title} item={item} isCurrentUrl={isCurrentUrl} t={t} />))}
            </SidebarMenu>
        </SidebarGroup>
    );
}

export default NavMain;