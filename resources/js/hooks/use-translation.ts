import { usePage } from '@inertiajs/react'
// USAR ESTO PARA AGREGAR TRADUCCIÓN A UN COMPONENTE
// import { useTranslation } from '@/hooks/use-translation'
//export default function COMPONENTE() {
//  const t = useTranslation()
export function useTranslation() {
    const { translations = {} } = usePage<{ translations?: Record<string, string> }>().props
    return (key: string, replacements: Record<string, string | number> = {}) => {
        let text = translations[key] ?? key
        Object.entries(replacements).forEach(([placeholder, value]) => {
            text = text.replaceAll(`:${placeholder}`, String(value))
        })
        return text
    }
}