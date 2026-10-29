import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isHydrated, setIsHydrated] = useState(false)

  // Carga tras hidratar (evita el choque SSR vs Cliente)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item !== null) setStoredValue(JSON.parse(item))
    } catch (e) {
      console.error(`[useLocalStorage] Error en "${key}":`, e)
    }
    setIsHydrated(true)
  }, [key])

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      setStoredValue((prev) => {
        const next = typeof value === "function" ? (value as (val: T) => T)(prev) : value
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(next))
        }
        return next
      })
    } catch (e) {
      console.error(`[useLocalStorage] Error guardando "${key}":`, e)
    }
  }

  // Sincronización entre pestañas
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          setStoredValue(e.newValue !== null ? JSON.parse(e.newValue) : initialValue)
        } catch {
          setStoredValue(initialValue)
        }
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [key, initialValue])

  return [storedValue, setValue, isHydrated] as const
}