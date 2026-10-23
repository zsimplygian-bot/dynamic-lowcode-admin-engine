import { memo, useState, useEffect } from 'react'
import { Link } from '@inertiajs/react'
import { ChevronRight } from 'lucide-react'
import { DynamicIcon } from '@/components/dynamic-icon'
import { SmartButton } from '@/components/smart-button'
import { SearchInput } from '@/components/search-input'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar } from '@/components/ui/sidebar'
import { useCurrentUrl } from '@/hooks/use-current-url'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useApi } from '@/hooks/use-api'
export interface ExtendedNavItem { title: string; href?: string; icon?: string; items?: ExtendedNavItem[] }
export interface NavMainProps { items?: ExtendedNavItem[] }
const NavItemContent = ({ item }: { item: ExtendedNavItem }) => ( <><DynamicIcon name={item.icon ?? 'table'} className="shrink-0 size-4" /><span className="truncate">{t(item.title)}</span></> )
const NavLink = memo(({ item, isCurrentUrl, ButtonComponent }: { item: ExtendedNavItem; isCurrentUrl: (href: string) => boolean; ButtonComponent: any }) => {
  const isActive = Boolean(item.href && isCurrentUrl(item.href))
  return (
    <ButtonComponent asChild={Boolean(item.href)} isActive={isActive} tooltip={{ children: t(item.title) }} className="w-full pr-2 [&_svg]:!size-4">
      {item.href ? (<Link href={item.href} prefetch className="flex items-center gap-2 w-full min-w-0"><NavItemContent item={item} /></Link>) 
      : (<div className="flex items-center gap-2 w-full min-w-0"><NavItemContent item={item} /></div>)}
    </ButtonComponent>
  )
})
const MenuItem = memo(({ item, isCurrentUrl, search }: { item: ExtendedNavItem; isCurrentUrl: (href: string) => boolean; search: string }) => {
  const { state } = useSidebar()
  const matchingSubs = item.items?.filter((sub) => sub.title.toLowerCase().includes(search)) ?? []
  if (search && !item.title.toLowerCase().includes(search) && !matchingSubs.length) return null
  const isChildActive = Boolean(item.items?.some((sub) => sub.href && isCurrentUrl(sub.href)))
  const [isOpen, setIsOpen] = useLocalStorage(`nav_${item.title}`, isChildActive)
  if (!item.items?.length) return <SidebarMenuItem><NavLink item={item} isCurrentUrl={isCurrentUrl} ButtonComponent={SidebarMenuButton} /></SidebarMenuItem>
  const subItems = search ? matchingSubs : item.items
  const isCollapsed = state === 'collapsed'
  const MenuTrigger = (
    <SidebarMenuButton tooltip={{ children: t(item.title) }} isActive={isChildActive} className="pr-2 [&_svg]:!size-4">
      <NavItemContent item={item} /> {!isCollapsed && <ChevronRight className="ml-auto shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />}
    </SidebarMenuButton>
  )
  const SubList = subItems.map((sub) => (
    isCollapsed ? (
      <DropdownMenuItem key={sub.title} asChild className="cursor-pointer"><Link href={sub.href ?? '#'} prefetch className="flex items-center gap-2 w-full"><NavItemContent item={sub}/></Link></DropdownMenuItem>
    ) : (<SidebarMenuSubItem key={sub.title} className="pr-0"><NavLink item={sub} isCurrentUrl={isCurrentUrl} ButtonComponent={SidebarMenuSubButton} /></SidebarMenuSubItem>)
  ))
  return (
    <SidebarMenuItem>
      {isCollapsed ? (
        <DropdownMenu><DropdownMenuTrigger asChild>{MenuTrigger}</DropdownMenuTrigger><DropdownMenuContent side="right" align="start" className="min-w-48">{SubList}</DropdownMenuContent></DropdownMenu>
      ) : (
        <Collapsible asChild open={search ? true : isOpen} onOpenChange={setIsOpen} className="group/collapsible">
          <div>
            <CollapsibleTrigger asChild>{MenuTrigger}</CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden transition-all duration-200 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              <SidebarMenuSub className="mr-0 pr-0">{SubList}</SidebarMenuSub>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}
    </SidebarMenuItem>
  )
})
export function NavMain({ items: initialItems = [] }: NavMainProps) {
  const { isCurrentUrl } = useCurrentUrl()
  const [search, setSearch] = useState('')
  const [items, setItems] = useLocalStorage<ExtendedNavItem[]>('app_nav_items', initialItems)
  const { data: navData } = useApi<ExtendedNavItem[]>('/api/navigation', { enabled: !items.length })
  useEffect(() => { if (navData?.length) setItems(navData) }, [navData, setItems])
  return (
    <SidebarGroup className="px-2 py-0 gap-2">
      <SidebarGroupLabel className="flex items-center justify-between w-full">
        <span>{t('Platform')}</span>
        <SmartButton href="/settings/table" variant="ghost" icon="pencil" size="xs" tooltip={t('Manage tables')} />
      </SidebarGroupLabel>
      <SearchInput value={search} onChange={setSearch} />
      <SidebarMenu className="mt-1"> {items.map((item) => <MenuItem key={item.title} item={item} isCurrentUrl={isCurrentUrl} search={search.trim().toLowerCase()} />)} </SidebarMenu>
    </SidebarGroup>
  )
}
export default NavMain