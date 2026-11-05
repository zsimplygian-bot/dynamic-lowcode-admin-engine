import { usePage } from '@inertiajs/react';

export function useCan() {
    const { props } = usePage<any>();
    const user = props.auth?.user;
    const permissions: string[] = user?.permissions ?? [];
    const roles: string[] = user?.roles ?? [];

    const can = (permission: string) => permissions.includes(permission);
    const hasRole = (role: string) => roles.includes(role);
    const isRole = (role: string) => hasRole(role);

    return { can, hasRole, isRole, user, permissions, roles };
}