import { useCallback } from "react"
import { router } from "@inertiajs/react"

type Method = "get" | "post" | "put" | "patch" | "delete"
type RouterOptions = Parameters<typeof router.visit>[1]

const req = (method: Method, url: string, data: any = {}, opts: RouterOptions = {}) =>
  new Promise<any>((resolve, reject) => {
    const options: RouterOptions = {
      preserveScroll: true,
      ...opts,
      onSuccess: (p) => { opts?.onSuccess?.(p); resolve(p) },
      onError: (e) => { opts?.onError?.(e); reject(e) },
      onCancel: () => { opts?.onCancel?.(); reject(new Error("Cancelled")) },
    }
    method === "delete" ? router.delete(url, { ...options, data }) : (router as any)[method](url, data, options)
  })

export function useRouter() {
  const get     = useCallback((url: string, data?: any, opts?: RouterOptions) => req("get", url, data, opts), [])
  const post    = useCallback((url: string, data?: any, opts?: RouterOptions) => req("post", url, data, opts), [])
  const put     = useCallback((url: string, data?: any, opts?: RouterOptions) => req("put", url, data, opts), [])
  const patch   = useCallback((url: string, data?: any, opts?: RouterOptions) => req("patch", url, data, opts), [])
  const destroy = useCallback((url: string, opts?: RouterOptions) => req("delete", url, {}, opts), [])
  const reload  = useCallback((opts?: RouterOptions) => new Promise<any>((res) => router.reload({ ...opts, onSuccess: res })), [])
  
  const download = useCallback((url: string, params: Record<string, any> = {}) => {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== "") q.append(k, String(v))
    })
    const str = q.toString()
    window.location.href = str ? `${url}?${str}` : url
  }, [])

  return { get, post, put, patch, delete: destroy, reload, download, raw: router }
}