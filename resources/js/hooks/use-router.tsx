import { router } from "@inertiajs/react"
type Opts = Parameters<typeof router.visit>[1]
const req = (method: any, url: string, data?: any, opts: Opts = {}) =>
  new Promise<any>((resolve, reject) =>
    router.visit(url, { method, data, preserveScroll: true, preserveState: true, ...opts,
      onSuccess: (p) => (opts?.onSuccess?.(p), resolve(p)),
      onError: (e) => (opts?.onError?.(e), reject(e)),
      onCancel: () => (opts?.onCancel?.(), reject(new Error("Cancelled"))),
    })
  )
const send = (method: string) => (url: string, data?: any, opts?: Opts) => req(method, url, data, opts)
export const http = {
  get: send("get"),
  post: send("post"),
  put: send("put"),
  patch: send("patch"),
  delete: send("delete"),
  reload: (opts?: Opts) => new Promise<any>((res) => router.reload({ ...opts, onSuccess: res })),
  // 3. Sin Object.entries ni bucles: URLSearchParams acepta el objeto plano directamente
  download: (url: string, params?: Record<string, any>) => {
    window.location.href = params ? `${url}?${new URLSearchParams(params)}` : url
  }, raw: router,
}
export const useRouter = () => http