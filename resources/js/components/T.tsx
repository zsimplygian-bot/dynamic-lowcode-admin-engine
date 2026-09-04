import { usePage } from '@inertiajs/react'

export function T({ children }: { children: string }) {
  const { translations = {} } = usePage<any>().props
  return <>{translations[children] ?? children}</>
}