// resources/js/hooks/datatable/use-datatable-storage.ts
import { useState, useCallback, useEffect } from "react"

export function useDataTableStorage<T extends Record<string, any>>(tableName: string, initialValue: T) {
  const key = `datatable_params_${tableName}`

  // 1. Inicializa siempre con initialValue para evitar Hydration Mismatch
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // 2. Lee de localStorage una vez montado el componente en el cliente
  useEffect(() => {
    try {
      const item = localStorage.getItem(key)
      if (item) setStoredValue(JSON.parse(item))
    } catch {}
  }, [key])

  const setStorage = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const next = typeof value === "function" ? value(prev) : { ...prev, ...value }
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