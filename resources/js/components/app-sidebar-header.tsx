import { Breadcrumbs } from '@/components/breadcrumbs'
import { SidebarTrigger } from '@/components/ui/sidebar'
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types'
import CitasDropdown from "@/components/dashboard/cita-dropdown"
import { SmartDropdown, type SDItem } from "@/components/smart-dropdown"
import LanguageDropdown from "@/components/language-dropdown"
import CssThemeDropdown from "@/components/css-theme-dropdown"
import AppearanceToggleDropdown from "@/components/appearance-dropdown"
import { FullscreenButton } from "@/components/fullscreen-button"
export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
  const settingsItems: SDItem[] = [
    { type: "item", custom: <div className="w-full [&>*]:w-full [&_button]:w-full [&_button]:justify-start"><LanguageDropdown /></div> },
    { type: "item", custom: <div className="w-full [&>*]:w-full [&_button]:w-full [&_button]:justify-start"><CssThemeDropdown /></div> },
    { type: "item", custom: <div className="w-full [&>*]:w-full [&_button]:w-full [&_button]:justify-start"><AppearanceToggleDropdown /></div> },
    { type: "item", custom: <div className="w-full [&>*]:w-full [&_button]:w-full [&_button]:justify-start"><FullscreenButton /></div> },
  ]
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <CitasDropdown />
        <SmartDropdown label="Fast settings" icon="settings" variant="ghost" size="md" align="end" items={settingsItems} />
      </div>
    </header>
  )
}