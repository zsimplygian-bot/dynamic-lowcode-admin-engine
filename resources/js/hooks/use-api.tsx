import { useState, useEffect, useRef, useCallback } from 'react'
import axios, { AxiosRequestConfig } from 'axios'

interface UseApiOptions<T> {
  enabled?: boolean
  initialData?: T
  config?: AxiosRequestConfig
  select?: (data: any) => T
}

export function useApi<T = any>(url: string | null, { enabled = true, initialData, config, select }: UseApiOptions<T> = {}) {
  const [data, setData] = useState<T>(initialData as T)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>(null)

  const configRef = useRef(config)
  configRef.current = config
  const selectRef = useRef(select)
  selectRef.current = select

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    if (!url) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await axios.get(url, { ...configRef.current, signal })
      const resolved = selectRef.current ? selectRef.current(res.data) : (res.data?.data ?? res.data)
      setData(resolved)
      return resolved
    } catch (err: any) {
      if (!axios.isCancel(err)) {
        setError(err)
      }
    } finally {
      setIsLoading(false)
    }
  }, [url])

  useEffect(() => {
    if (!enabled || !url) return
    const controller = new AbortController()
    fetchData(controller.signal)
    return () => controller.abort()
  }, [enabled, url, JSON.stringify(config?.params)])

  return { data: data ?? (initialData as T), isLoading, error, setData, refetch: fetchData }
}