import React, { useSyncExternalStore } from 'react'
import { router } from '@inertiajs/react'

type Translations = Record<string, string>

let currentTranslations: Translations = {}
let currentLocale = 'en'
let version = 0
const listeners = new Set<() => void>()

const subscribe = (cb: () => void) => (listeners.add(cb), () => listeners.delete(cb))
const notify = () => { version++; listeners.forEach((l) => l()) }

export function syncTranslations(props?: { translations?: Translations; locale?: string }) {
  if (props?.translations) currentTranslations = { ...props.translations }
  if (props?.locale) currentLocale = props.locale
  notify()
}

export function initializeTranslations() {
  if (typeof window === 'undefined') return
  const initialProps = (window as any).page?.props
  if (initialProps) syncTranslations(initialProps)
}

export function getLocale() {
  return currentLocale
}

if (typeof window !== 'undefined') {
  router.on('navigate', (event) => syncTranslations(event.detail.page.props as any))
}

export function t(key: string, replacements: Record<string, string | number> = {}): string {
  let text = currentTranslations[key] ?? key
  Object.entries(replacements).forEach(([k, v]) => { text = text.replaceAll(`:${k}`, String(v)) })
  return text
}

export function useTranslation() {
  useSyncExternalStore(subscribe, () => version, () => 0)
  return { t, locale: currentLocale }
}

if (typeof globalThis !== 'undefined') globalThis.t = t
export default t