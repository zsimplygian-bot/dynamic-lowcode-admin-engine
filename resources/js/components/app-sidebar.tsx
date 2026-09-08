import { useMemo } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2 } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
const footerNavItems: NavItem[] = [
    { title: 'Repositorio', href: 'https://github.com/laravel/react-starter-kit', icon: FolderGit2 },
    { title: 'Documentación', href: 'https://laravel.com/docs/starter-kits#react', icon: BookOpen },
];
export function AppSidebar() {
    const { mainNavItems = [] } = usePage<{ mainNavItems?: any[] }>().props;
    const resolvedMainNavItems = useMemo(() => {
        return mainNavItems.map(item => ({
            ...item,
            iconName: item.icon,
            items: item.items?.map((sub: any) => ({ ...sub, iconName: sub.icon })),
        }));
    }, [mainNavItems]);
    return (
        <Sidebar {...{ collapsible: "icon", variant: "inset" }}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton {...{ size: "lg", asChild: true }}>
                            <Link {...{ href: dashboard(), prefetch: true }}><AppLogo /></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain {...{ items: resolvedMainNavItems }} />
            </SidebarContent>
            <SidebarFooter>
                <NavFooter {...{ items: footerNavItems, className: "mt-auto" }} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}