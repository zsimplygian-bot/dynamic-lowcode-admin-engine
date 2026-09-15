import { useState } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      setStoredValue((prev) => {
        const nextValue = typeof value === "function" ? (value as (val: T) => T)(prev) : value
        localStorage.setItem(key, JSON.stringify(nextValue))
        return nextValue
      })
    } catch (e) {
      console.error(e)
    }
  }

  return [storedValue, setValue] as const
}