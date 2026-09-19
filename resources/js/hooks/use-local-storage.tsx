import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  // Sincroniza si la clave cambia dinámicamente (p. ej. cambio de tabla)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item !== null) {
        setStoredValue(JSON.parse(item))
      } else {
        setStoredValue(initialValue)
      }
    } catch {
      setStoredValue(initialValue)
    }
  }, [key])

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      setStoredValue((prev) => {
        const nextValue = typeof value === "function" ? (value as (val: T) => T)(prev) : value
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(nextValue))
        }
        return nextValue
      })
    } catch (e) {
      console.error(e)
    }
  }

  return [storedValue, setValue] as const
}