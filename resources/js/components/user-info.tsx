import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();
    // Tomamos el primer rol asignado (o 'Usuario' por defecto si no tiene ninguno)
    const mainRole = user.roles?.[0] ?? null;

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage 
    src={user.avatar_thumb || user.avatar || undefined} 
    alt={user.name} 
/>
<AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <div className="flex items-center gap-1.5">
                    <span className="truncate font-medium">{user.name}</span>
                    {mainRole && (
                        <span className="inline-flex items-center rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold capitalize text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                            {mainRole}
                        </span>
                    )}
                </div>

                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}