import { useCallback } from "react"
import { router, VisitOptions } from "@inertiajs/react"

type HttpMethod = "get" | "post" | "put" | "patch" | "delete"

const makeAsyncRequest = (method: HttpMethod, url: string, data: any = {}, options: VisitOptions = {}) => {
  return new Promise<any>((resolve, reject) => {
    const opts: VisitOptions = {
      preserveScroll: true,
      ...options,
      onSuccess: (page) => { options.onSuccess?.(page); resolve(page) },
      onError: (errors) => { options.onError?.(errors); reject(errors) },
      onCancel: () => { options.onCancel?.(); reject(new Error("Request cancelled")) },
    }

    if (method === "get") router.get(url, data, opts)
    else if (method === "post") router.post(url, data, opts)
    else if (method === "put") router.put(url, data, opts)
    else if (method === "patch") router.patch(url, data, opts)
    else if (method === "delete") router.delete(url, { ...opts, data })
  })
}

export function useRouter() {
  const get = useCallback((url: string, data?: any, opts?: VisitOptions) => makeAsyncRequest("get", url, data, opts), [])
  const post = useCallback((url: string, data?: any, opts?: VisitOptions) => makeAsyncRequest("post", url, data, opts), [])
  const put = useCallback((url: string, data?: any, opts?: VisitOptions) => makeAsyncRequest("put", url, data, opts), [])
  const patch = useCallback((url: string, data?: any, opts?: VisitOptions) => makeAsyncRequest("patch", url, data, opts), [])
  const destroy = useCallback((url: string, opts?: VisitOptions) => makeAsyncRequest("delete", url, {}, opts), [])
  const reload = useCallback((opts?: VisitOptions) => new Promise<any>((resolve) => router.reload({ ...opts, onSuccess: resolve })), [])

  return { get, post, put, patch, delete: destroy, reload, raw: router }
}