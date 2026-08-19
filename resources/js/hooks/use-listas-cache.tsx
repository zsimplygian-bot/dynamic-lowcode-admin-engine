export interface ListaCache {
  options: Array<{ id: any; label: string }>
  viewConfig: { view: string; title: string; fields: Array<any> } | null
  isFullLoaded: boolean
}
const cache = new Map<string, ListaCache>()
const listeners = new Map<string, Set<(data: ListaCache) => void>>()
const EMPTY_CACHE: ListaCache = Object.freeze({ options: [], viewConfig: null, isFullLoaded: false })
export const getListaSync = (campo: string): ListaCache => (campo ? cache.get(campo) ?? EMPTY_CACHE : EMPTY_CACHE)
export const subscribeCache = (campo: string, callback: (data: ListaCache) => void) => {
  if (!campo) return () => {}
  if (!listeners.has(campo)) listeners.set(campo, new Set())
  const set = listeners.get(campo)!
  set.add(callback)
  return () => {
    set.delete(callback)
    if (!set.size) listeners.delete(campo)
  }
}
export const setListaCache = (campo: string, data: any, isFull: boolean = false): ListaCache => {
  if (!campo) return EMPTY_CACHE
  const isArray = Array.isArray(data)
  const incomingOpts: Array<{ id: any; label: string }> = isArray ? data : (data?.options ?? [])
  const incomingConfig = isArray ? null : (data?.viewConfig ?? null)
  const existing = cache.get(campo)
  if (!incomingOpts.length && !incomingConfig && existing) return existing
  const optsMap = new Map<string, { id: any; label: string }>()
  existing?.options.forEach((o) => optsMap.set(String(o.id), o))
  incomingOpts.forEach((o) => optsMap.set(String(o.id), o))
  const updated: ListaCache = {
    options: Array.from(optsMap.values()),
    viewConfig: incomingConfig ?? existing?.viewConfig ?? null,
    isFullLoaded: isFull || (existing?.isFullLoaded ?? false)
  }
  cache.set(campo, updated)
  listeners.get(campo)?.forEach((cb) => cb(updated))
  return updated
}
export const resetLista = (campo: string) => {
  if (!campo) return
  cache.delete(campo)
  listeners.get(campo)?.forEach((cb) => cb(EMPTY_CACHE))
}