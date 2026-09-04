import { memo } from 'react'
import { Languages } from 'lucide-react'
import { SmartDropdown } from '@/components/smart-dropdown'
import { useTranslation } from '@/hooks/use-translation'
import { useRouter } from '@/hooks/use-router'
const LOCALES = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
] as const
export const LanguageDropdown = memo(function LanguageDropdown() {
  const { locale } = useTranslation()
  const { post } = useRouter()
  const items = LOCALES.map(({ code, label }) => ({
    label,
    action: () => code !== locale && post('/locale', { locale: code }, { preserveState: false }),
    color: locale === code ? 'font-bold text-primary' : undefined,
  }))
  return <SmartDropdown icon={Languages} variant="ghost" label="Idioma / Language / 言語" items={items} />
})
LanguageDropdown.displayName = 'LanguageDropdown'
export default LanguageDropdown