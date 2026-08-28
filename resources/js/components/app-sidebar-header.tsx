import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { FullscreenButton } from '@/components/fullscreen-button';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import AppearanceToggleDropdown from "@/components/appearance-dropdown";
import CitasDropdown from "@/components/dashboard/cita-dropdown";

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-2 ml-auto">
                <CitasDropdown />
                <AppearanceToggleDropdown />
                <FullscreenButton />
            </div>
        </header>
    );
}