import { usePage } from '@inertiajs/react';

// Definimos la interfaz para el tipado estricto
interface AuthUser {
    id: number;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
    [key: string]: any; // Por si hay más campos del usuario
}

interface PageProps extends Record<string, unknown> {
    auth: {
        user: AuthUser | null;
    };
}

export function useAuth() {
    const { auth } = usePage<PageProps>().props;
    const user = auth?.user;

    // Verificar si tiene un rol exacto
    const hasRole = (role: string): boolean => {
        return user?.roles?.includes(role) ?? false;
    };

    // Verificar si tiene al menos un rol de un array de roles
    const hasAnyRole = (roles: string[]): boolean => {
        return roles.some((role) => user?.roles?.includes(role));
    };

    // Verificar si tiene un permiso exacto
    const can = (permission: string): boolean => {
        return user?.permissions?.includes(permission) ?? false;
    };

    return {
        user,
        hasRole,
        hasAnyRole,
        can,
        isAuthenticated: user !== null,
    };
}