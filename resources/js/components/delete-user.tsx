import { Form } from '@inertiajs/react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { SmartButton } from '@/components/smart-button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);
    return (
        <div className="space-y-6">
            <Heading variant="small" title="Borrar cuenta" description="Borra tu cuenta y todo sus datos" />
            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">Advertencia</p>
                    <p className="text-sm">Porfavor proceder con cuidado, esto no se puede revertir.</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <SmartButton variant="destructive" label="Borrar cuenta" data-test="delete-user-button" />
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Estas seguro de que quieres borrar tu cuenta?</DialogTitle>
                        <DialogDescription>
                            Una vez tu cuenta es borrada, todos sus datos tambien serán permanentemente borrados.
                            Porfavor ingresa tu contraseña para confirmar que quieres borrar tu cuenta para siempre.
                        </DialogDescription>
                        <Form {...ProfileController.destroy.form()} options={{ preserveScroll: true }} onError={() => passwordInput.current?.focus()}
                            resetOnSuccess className="space-y-6" >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <><div className="grid gap-2">
                                        <Label htmlFor="password" className="sr-only">Password</Label>
                                        <PasswordInput id="password" name="password" ref={passwordInput} placeholder="Password" autoComplete="current-password"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <DialogFooter className="gap-2">
                                        <DialogClose asChild>
                                            <SmartButton variant="secondary" label="Cancelar" onClick={resetAndClearErrors} />
                                        </DialogClose>
                                        <SmartButton type="submit" variant="destructive" label="Borrar cuenta" loading={processing} disabled={processing}
                                            data-test="confirm-delete-user-button" />
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}