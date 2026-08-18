import { Link } from '@inertiajs/react';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';
import { SmartButton } from '@/components/smart-button';
import { Pencil } from 'lucide-react';
export function NavMain({ items = [] }: { items: NavItem[] }) {
  const { isCurrentUrl } = useCurrentUrl();
  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarGroupLabel className="flex items-center justify-between w-full">
        <span>Platform</span>
        <SmartButton {...{ href: "/settings/navigation", variant: "ghost", icons: Pencil, size: "sm", tooltip: "Administrar navegación" }} />
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton {...{ asChild: true, isActive: isCurrentUrl(item.href), tooltip: { children: item.title } }}>
              <Link href={item.href} prefetch>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}