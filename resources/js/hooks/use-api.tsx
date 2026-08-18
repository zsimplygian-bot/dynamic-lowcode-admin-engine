import { useState, useEffect } from 'react'
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
  useEffect(() => {
    if (!enabled || !url) return
    let isMounted = true
    const controller = new AbortController()
    setIsLoading(true)
    setError(null)
    axios.get(url, { ...config, signal: controller.signal })
      .then((res) => {
        if (!isMounted) return
        const resolvedData = select ? select(res.data) : (res.data?.data ?? res.data)
        setData(resolvedData)
      })
      .catch((err) => { if (!axios.isCancel(err) && isMounted) setError(err) })
      .finally(() => { if (isMounted) setIsLoading(false) })
    return () => { isMounted = false; controller.abort() }
  }, [url, enabled, JSON.stringify(config)])
  return { data, isLoading, error, setData }
}