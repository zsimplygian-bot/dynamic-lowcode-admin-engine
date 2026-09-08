// resources/js/hooks/datatable/use-datatable-storage.ts
import { useState, useCallback } from "react"

export function useDataTableStorage<T>(keySuffix: string, fallback: T) {
  const key = `dt_${keySuffix}`

  // Lectura síncrona en el primer render: CERO doble petición HTTP
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return fallback
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : fallback
    } catch {
      return fallback
    }
  })

  const setStorage = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const next = typeof value === "function" ? (value as any)(prev) : { ...prev, ...value }
      try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
      return next
    })
  }, [key])

  const clearStorage = useCallback(() => {
    try { localStorage.removeItem(key) } catch {}
    setStoredValue(fallback)
  }, [key, fallback])

  return { storedValue, setStorage, clearStorage }
}