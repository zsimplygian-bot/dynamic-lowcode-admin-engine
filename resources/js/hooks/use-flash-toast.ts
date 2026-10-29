import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface ToastAction {
    label: string;
    url: string;
    method?: 'post' | 'put' | 'delete' | 'get';
    data?: Record<string, any>;
}

export function useFlashToast(): void {
    useEffect(() => {
        return router.on('flash', (event) => {
            const flash = (event as CustomEvent).detail?.flash;
            const data = flash?.toast as any;

            if (!data?.message) {
                return;
            }

            const action = data.action as ToastAction | undefined;

            toast[data.type || 'success'](data.message, {
                action: action ? {
                    label: action.label,
                    onClick: () => {
                        const method = (action.method?.toLowerCase() || 'post') as 'post' | 'put' | 'delete' | 'get';

                        router[method](action.url, action.data || {}, {
                            preserveScroll: true,
                            preserveState: true,
                            onSuccess: () => {
                                // Emitimos la señal para que la tabla se refresque sola
                                window.dispatchEvent(new CustomEvent('table-reload'));
                            },
                        });
                    },
                } : undefined,
                duration: action ? 7000 : 4000,
            });
        });
    }, []);
}