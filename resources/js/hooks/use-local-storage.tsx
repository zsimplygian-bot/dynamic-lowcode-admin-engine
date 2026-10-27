import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  // 1. Lee directo en el primer render: sin doble render ni estados "mounted"
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  // 2. Guarda el valor de forma directa
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
      console.error("useLocalStorage error:", e)
    }
  }

  // 3. Si tu botón de borrar caché hace removeItem/setItem desde fuera, se actualiza solo
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

  return [storedValue, setValue] as const
}