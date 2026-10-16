import { usePage } from '@inertiajs/react';
import { SmartDropdown } from '@/components/smart-dropdown';
import { http } from '@/hooks/use-router';
const LOCALES = [ { code: 'en', label: 'English' },
                  { code: 'es', label: 'Español' },
                  { code: 'ja', label: '日本語' }, ] as const;
export default function LanguageDropdown() {
  const { locale } = usePage<any>().props;
  return ( <SmartDropdown buttonLabel="Change language" icon="languages" variant="ghost" label="Language / Idioma / 言語"
            items={LOCALES.map(({ code, label }) => ({ label, action: () => code !== locale && http.post('/locale', { locale: code }), }))} /> );
}