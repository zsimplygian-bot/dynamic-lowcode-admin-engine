import { useState, useEffect, useCallback } from "react"

export function useDataTableStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const item = localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (e) {
      console.error(e)
    }
    setIsHydrated(true)
  }, [key])

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return
    try {
      localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (e) {
      console.error(e)
    }
  }, [key, storedValue, isHydrated])

  const clearStorage = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(key)
      } catch (e) {
        console.error(e)
      }
    }
    setStoredValue(initialValue)
  }, [key, initialValue])

  return { storedValue, setStoredValue, clearStorage }
}