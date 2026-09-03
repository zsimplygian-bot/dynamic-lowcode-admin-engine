import { useState, useEffect, useCallback, useRef } from "react"
import { isCancel, AxiosRequestConfig, AxiosResponse } from "axios"
import { api } from "@/lib/api"
interface UseApiOptions<T> {
  enabled?: boolean
  initialData?: T
  config?: AxiosRequestConfig
  select?: (data: any) => T
}
function areParamsEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (!a || !b) return false
  const keysA = Object.keys(a), keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  return keysA.every((key) => a[key] === b[key])
}
export function useApi<T = any>(
  url?: string | null | false,
  { enabled = true, initialData, config, select }: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | undefined>(initialData)
  const [status, setStatus] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(enabled && url))
  const [error, setError] = useState<string | null>(null)
  const [refetchIndex, setRefetchIndex] = useState<number>(0)
  const configRef = useRef(config)
  configRef.current = config
  const selectRef = useRef(select)
  selectRef.current = select
  const prevParamsRef = useRef(config?.params)
  const refetch = useCallback(() => {
    setRefetchIndex((prev) => prev + 1)
  }, [])
  const fetchData = useCallback(
    async (signal: AbortSignal) => {
      if (!url) return
      setIsLoading(true)
      setError(null)
      try {
        const res: AxiosResponse = await api.get(url, { ...configRef.current, signal })
        const parsedData = selectRef.current ? selectRef.current(res.data) : res.data
        if (!signal.aborted) {
          setData(parsedData)
          setStatus(res.status)
        }
        return parsedData
      } catch (err: any) {
        if (!isCancel(err) && !signal.aborted) {
          setStatus(err.response?.status ?? null)
          setError(err.response?.data?.message ?? err.message ?? "Error al cargar")
        }
      } finally {
        if (!signal.aborted) setIsLoading(false)
      }
    },
    [url]
  )
  useEffect(() => {
    if (!enabled || !url) {
      setIsLoading(false)
      return
    }
    const currentParams = config?.params
    const paramsChanged = !areParamsEqual(prevParamsRef.current, currentParams)
    prevParamsRef.current = currentParams
    const ctrl = new AbortController()
    if (paramsChanged || refetchIndex > 0 || isLoading) {
      fetchData(ctrl.signal)
    }
    return () => ctrl.abort()
  }, [enabled, url, config?.params, refetchIndex, fetchData])
  return { data, status, isLoading, error, setData, refetch }
}