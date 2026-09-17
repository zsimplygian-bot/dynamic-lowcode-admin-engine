import { memo } from 'react';
import { Languages } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { SmartDropdown } from '@/components/smart-dropdown';

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'ja', label: '日本語' },
] as const;

export const LanguageDropdown = memo(function LanguageDropdown() {
  const { locale } = usePage<any>().props;

  const items = LOCALES.map(({ code, label }) => ({
    label,
    action: () =>
      code !== locale &&
      router.post('/locale', { locale: code }, { preserveState: false }),
    color: locale === code ? 'font-bold text-primary' : undefined,
  }));

  return (
    <SmartDropdown buttonLabel="Change languaje"
      icon={Languages}
      variant="ghost"
      label="Language / Idioma / 言語"
      items={items}
    />
  );
});

LanguageDropdown.displayName = 'LanguageDropdown';
export default LanguageDropdown;