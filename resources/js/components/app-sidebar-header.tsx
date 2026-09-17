import { Menu } from "lucide-react"
import { Breadcrumbs } from '@/components/breadcrumbs'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FullscreenButton } from '@/components/fullscreen-button'
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types'
import AppearanceToggleDropdown from "@/components/appearance-dropdown"
import CitasDropdown from "@/components/dashboard/cita-dropdown"
import CssThemeDropdown from "@/components/css-theme-dropdown"
import LanguageDropdown from "@/components/language-dropdown"

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <CitasDropdown />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Menu className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-auto min-w-0 p-1.5">
            <div className="flex flex-col items-center gap-1">
              <LanguageDropdown />
              <CssThemeDropdown />
              <AppearanceToggleDropdown />
              <FullscreenButton />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}