import { usePage } from '@inertiajs/react'

export function useTranslation() {
  const { translations = {} } = usePage<any>().props
  return (key: string) => translations[key] ?? key
}