import { useState, useCallback } from "react"

export function useDataTableStorage<T extends Record<string, any>>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch { return initialValue }
  })

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