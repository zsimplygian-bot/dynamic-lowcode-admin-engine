// resources/js/hooks/datatable/use-datatable-storage.ts
import { useState, useCallback } from "react"
export function useDataTableStorage<T extends Record<string, any>>(tableName: string, initialValue: T) {
  const key = `datatable_params_${tableName}`
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch { return initialValue }
  })
  const setStorage = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const next = typeof value === "function" ? value(prev) : { ...prev, ...value }
      // Persistencia asíncrona diferida para no bloquear el renderizado
      queueMicrotask(() => {
        try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
      })
      return next
    })
  }, [key])
  const clearStorage = useCallback(() => {
    try { localStorage.removeItem(key) } catch {}
    setStoredValue(initialValue)
  }, [key, initialValue])
  return { storedValue, setStorage, clearStorage }
}