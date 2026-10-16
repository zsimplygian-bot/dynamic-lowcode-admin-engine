import { usePage } from '@inertiajs/react'
import AppLogoIcon from '@/components/app-logo-icon'
import { useThumb } from '@/hooks/use-thumb'
interface AppSettings { app_name?: string; app_icon?: string | null }
interface SharedData { appSettings?: AppSettings; [key: string]: unknown }
export default function AppLogo() {
  const { appSettings } = usePage<SharedData>().props
  const name = appSettings?.app_name || 'Laravel'
  const { thumbUrl } = useThumb(appSettings?.app_icon)
  return (
    <><div className={`flex aspect-square size-8 shrink-0 items-center justify-center rounded-md overflow-hidden ${!thumbUrl ? 'bg-sidebar-primary text-sidebar-primary-foreground' : ''}`}>
        {thumbUrl ? ( <img src={thumbUrl} alt={name} className="size-full object-contain p-0.5" />
        ) : ( <AppLogoIcon className="size-5 fill-current text-white dark:text-black" /> )}
      </div>
      <div className="ml-1 grid flex-1 text-left text-sm min-w-0"> <span className="mb-0.5 truncate leading-tight font-semibold">{name}</span> </div>
    </>
  )
}