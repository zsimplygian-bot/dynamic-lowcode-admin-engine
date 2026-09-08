import { router } from '@inertiajs/react';

export function __(key: string, replacements: Record<string, string | number> = {}): string {
    const translations = (router.page?.props as any)?.translations ?? {};
    let text = translations[key] ?? key;

    Object.entries(replacements).forEach(([placeholder, value]) => {
        text = text.replaceAll(`:${placeholder}`, String(value));
    });

    return text;
}