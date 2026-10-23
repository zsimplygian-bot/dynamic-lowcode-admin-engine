import { router } from '@inertiajs/react'
import { SmartDropdown } from '@/components/smart-dropdown'
import { getLocale } from '@/hooks/use-translation'

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'ja', label: '日本語' },
] as const

export default function LanguageDropdown() {
  const handleLanguageChange = (targetCode: string) => {
    const currentLocale = getLocale()

    if (targetCode === currentLocale) return

    router.post(
      '/locale',
      { locale: targetCode },
      {
        preserveState: true,
        preserveScroll: true,
      }
    )
  }

  return (
    <SmartDropdown
      buttonLabel="Change language"
      icon="languages"
      variant="ghost"
      label="Language / Idioma / 言語"
      items={LOCALES.map(({ code, label }) => ({
        label,
        action: () => handleLanguageChange(code),
      }))}
    />
  )
}