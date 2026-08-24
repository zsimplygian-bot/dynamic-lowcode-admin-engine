import { useState, useCallback, useEffect } from "react"

export function useDataTableStorage<T extends Record<string, any>>(key: string, initialValue: T) {
  // Inicializa siempre con initialValue para coincidir exactamente con el HTML generado en SSR
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Sincroniza con localStorage únicamente cuando el componente ya está montado en el cliente
  useEffect(() => {
    try {
      const item = localStorage.getItem(key)
      if (item) setStoredValue(JSON.parse(item))
    } catch (e) {
      console.error(e)
    }
  }, [key])

  const setStorage = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const nextValue = typeof value === "function" ? value(prev) : { ...prev, ...value }
      if (typeof window !== "undefined") {
        try { localStorage.setItem(key, JSON.stringify(nextValue)) }
        catch (e) { console.error(e) }
      }
      return nextValue
    })
  }, [key])

  const clearStorage = useCallback(() => {
    if (typeof window !== "undefined") {
      try { localStorage.removeItem(key) }
      catch (e) { console.error(e) }
    }
    setStoredValue(initialValue)
  }, [key, initialValue])

  return { storedValue, setStorage, clearStorage }
}