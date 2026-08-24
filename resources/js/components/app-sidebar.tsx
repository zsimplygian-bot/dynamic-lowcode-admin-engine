import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { DynamicIcon } from '@/components/dynamic-icon';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const defaultMainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { props } = usePage<{ mainNavItems?: any[] }>();

    const resolvedMainNavItems = props.mainNavItems && props.mainNavItems.length > 0
        ? props.mainNavItems.map(item => ({
            ...item,
            icon: () => <DynamicIcon {...{ name: item.icon || 'LayoutGrid', className: "size-4" }} />,
            items: item.items?.map((subItem: any) => ({
                ...subItem,
                icon: () => <DynamicIcon {...{ name: subItem.icon || 'LayoutGrid', className: "size-4" }} />,
            })),
        }))
        : defaultMainNavItems;

    return (
        <Sidebar {...{ collapsible: "icon", variant: "inset" }}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton {...{ size: "lg", asChild: true }}>
                            <Link {...{ href: dashboard(), prefetch: true }}>
                                <AppLogo />
                            </Link>
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