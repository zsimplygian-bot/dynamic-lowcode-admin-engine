import { useState, useEffect, useCallback, useRef } from "react"
import { isCancel } from "axios"
import { api } from "@/lib/api"

export interface UseApiOptions<T = any> {
  params?: Record<string, any>
  enabled?: boolean
  initialData?: T
  select?: (raw: any) => T
}

export function useApi<T = any>(url?: string | null | false, options: UseApiOptions<T> = {}) {
  const { params, enabled = true, initialData, select } = options
  const [data, setData] = useState<T | undefined>(initialData)
  const [raw, setRaw] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(Boolean(enabled && url))
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<number | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const selectRef = useRef(select)
  selectRef.current = select
  const paramsKey = JSON.stringify(params)

  const refetch = useCallback(async (extraParams?: Record<string, any>) => {
    if (!enabled || !url) return setIsLoading(false)

    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setIsLoading(true)
    setError(null)

    try {
      const res = await api.get(url, { params: { ...params, ...extraParams }, signal: ctrl.signal })
      const resData = res.data
      // Desempaqueta resData.data automáticamente si no pasas select personalizado
      const parsed = selectRef.current ? selectRef.current(resData) : (resData?.data ?? resData)
      setData(parsed)
      setRaw(resData)
      setStatus(res.status)
      return parsed
    } catch (err: any) {
      if (!isCancel(err)) {
        setStatus(err.response?.status ?? null)
        setError(err.response?.data?.message ?? err.message ?? "Error al cargar")
      }
    } finally {
      if (!ctrl.signal.aborted) setIsLoading(false)
    }
  }, [url, enabled, paramsKey])

  useEffect(() => {
    refetch()
    return () => abortRef.current?.abort()
  }, [refetch])

  return { data, raw, isLoading, error, status, setData, refetch }
}