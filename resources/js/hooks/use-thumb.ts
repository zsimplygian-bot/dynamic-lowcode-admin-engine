import { useMemo } from 'react'

export const useThumb = (url?: string | null) => {
  return useMemo(() => {
    if (!url) return { thumbUrl: null, hdUrl: null }
    if (url.startsWith('blob:')) return { thumbUrl: url, hdUrl: url }

    const isThumb = url.includes('_thumb.')
    return {
      thumbUrl: isThumb ? url : url.replace(/\.([^.]+)$/, '_thumb.$1'),
      hdUrl: isThumb ? url.replace(/_thumb\./, '.') : url
    }
  }, [url])
}