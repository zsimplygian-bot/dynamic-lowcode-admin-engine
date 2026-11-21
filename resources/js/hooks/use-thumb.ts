import { useMemo } from 'react'
export const useThumb = (url?: string | null) => {
  return useMemo(() => {
    if (!url) return { thumbUrl: null, hdUrl: null }
    if (url.startsWith('blob:') || url.startsWith('data:')) return { thumbUrl: url, hdUrl: url }
    const isFull = url.includes('_full.')
    return {
      thumbUrl: isFull ? url.replace('_full.', '.') : url,
      hdUrl: isFull ? url : url.replace(/\.([^.]+)$/, '_full.$1')
    }
  }, [url])
}