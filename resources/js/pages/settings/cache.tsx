import { Head, router } from '@inertiajs/react'
import { useState } from 'react'
import Heading from '@/components/heading'
import { SmartButton } from '@/components/smart-button'
import { SmartCard } from '@/components/smart-card'
import { useTranslation } from '@/hooks/use-translation'
export default function Cache() {
  const t = useTranslation()
  const [clearing, setClearing] = useState(false)
  const handleClearGlobalCache = () => {
    setClearing(true)
    localStorage.clear()
    sessionStorage.clear()
    router.delete('/settings/cache', {
      preserveScroll: true,
      onFinish: () => setClearing(false),
    })
  }
  return (
    <><Head title={t('System cache')} />
      <div className="space-y-4">
        <Heading variant="small" title={t('System cache')} description={t('Clear application cache, compiled routes, views, settings, and browser storage')} />
        <SmartCard variant="destructive" icon="alert-triangle" title={t('Global cache wipe')} description={ 
          <>{t('This action will run')}{' '}<code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">php artisan optimize:clear</code>{' '}{t('on the server and clear local browser storage.')}</> } >
          <SmartButton variant="destructive" icon="trash-2" label={t('Clear cache')} loadingLabel={t('Clearing...')} isLoading={clearing} onClick={handleClearGlobalCache} />
        </SmartCard>
      </div>
    </>
  )
}
Cache.layout = { breadcrumbs: [{ title: 'System cache', href: '/settings/cache' }] }