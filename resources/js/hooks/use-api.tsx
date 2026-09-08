import { useState, useEffect, useCallback, useRef } from "react"
import { isCancel, AxiosRequestConfig, AxiosResponse } from "axios"
import { api } from "@/lib/api"

interface UseApiOptions<T> {
  enabled?: boolean
  initialData?: T
  config?: AxiosRequestConfig
  select?: (data: any) => T
}

export function useApi<T = any>(
  url?: string | null | false,
  { enabled = true, initialData, config, select }: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | undefined>(initialData)
  const [status, setStatus] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(enabled && url))
  const [error, setError] = useState<string | null>(null)

  // 1. Soporta cualquier tipo de dato (arrays, objetos anidados, booleanos, strings)
  const paramsKey = JSON.stringify(config?.params)

  const abortCtrlRef = useRef<AbortController | null>(null)
  const selectRef = useRef(select)
  selectRef.current = select
  const configRef = useRef(config)
  configRef.current = config

  // 2. Función de ejecución directa (cancela la anterior si sigue en vuelo)
  const execute = useCallback(async () => {
    if (!enabled || !url) {
      setIsLoading(false)
      return
    }

    abortCtrlRef.current?.abort() // Cancela cualquier petición previa pendiente
    const ctrl = new AbortController()
    abortCtrlRef.current = ctrl

    setIsLoading(true)
    setError(null)

    try {
      const res: AxiosResponse = await api.get(url, { ...configRef.current, signal: ctrl.signal })
      const parsed = selectRef.current ? selectRef.current(res.data) : res.data
      if (!ctrl.signal.aborted) {
        setData(parsed)
        setStatus(res.status)
      }
      return parsed
    } catch (err: any) {
      if (!isCancel(err) && !ctrl.signal.aborted) {
        setStatus(err.response?.status ?? null)
        setError(err.response?.data?.message ?? err.message ?? "Error al cargar")
      }
    } finally {
      if (!ctrl.signal.aborted) setIsLoading(false)
    }
  }, [enabled, url, paramsKey])

  // 3. Solo se dispara cuando cambian realmente la URL, los params o enabled
  useEffect(() => {
    execute()
    return () => abortCtrlRef.current?.abort()
  }, [execute])

  return {
    data,
    status,
    isLoading,
    error,
    setData,
    refetch: execute, // Directo: sin estados intermediarios ni números de conteo
  }
}