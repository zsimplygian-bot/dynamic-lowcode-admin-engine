export interface ListaItem { id: any; label: string }
export interface ListaCache { options: ListaItem[]; isFull: boolean }

const cache = new Map<string, ListaCache>()
const listeners = new Map<string, Set<(data: ListaCache) => void>>()
const EMPTY: ListaCache = { options: [], isFull: false }

export const getListaSync = (k: string): ListaCache => (k ? cache.get(k) ?? EMPTY : EMPTY)

export const subscribeCache = (k: string, cb: (d: ListaCache) => void) => {
  if (!k) return () => {}
  if (!listeners.has(k)) listeners.set(k, new Set())
  const set = listeners.get(k)!
  set.add(cb)
  return () => { set.delete(cb); if (!set.size) listeners.delete(k) }
}

export const updateListaCache = (k: string, incoming: any, isFull = false) => {
  if (!k || !incoming) return
  const rawList: ListaItem[] = Array.isArray(incoming) ? incoming : (incoming.options ?? [incoming])
  const current = cache.get(k)
  const map = new Map<string, ListaItem>()
  current?.options.forEach((o) => map.set(String(o.id), o))
  rawList.forEach((o) => { if (o?.id !== undefined) map.set(String(o.id), o) })

  const updated: ListaCache = { options: Array.from(map.values()), isFull: isFull || (current?.isFull ?? false) }
  cache.set(k, updated)
  listeners.get(k)?.forEach((cb) => cb(updated))
}

export const resetLista = (k: string) => {
  if (!k) return
  cache.delete(k)
  listeners.get(k)?.forEach((cb) => cb(EMPTY))
}