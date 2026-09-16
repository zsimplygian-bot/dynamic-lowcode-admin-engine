import { Form, Head, usePage, Link } from '@inertiajs/react'
import { Save } from 'lucide-react'
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController'
import DeleteUser from '@/components/delete-user'
import Heading from '@/components/heading'
import { FormGroup } from '@/components/form-group'
import { SmartButton } from '@/components/smart-button'
import { useTranslation } from '@/hooks/use-translation'
import { edit } from '@/routes/profile'
import { send } from '@/routes/verification'
import type { Auth } from '@/types'
type PageProps = { auth: Auth }
export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
  const t = useTranslation()
  const { auth } = usePage<PageProps>().props
  return (
    <><Head title={t('Profile settings')} />
      <h1 className="sr-only">{t('Profile settings')}</h1>
      <div className="space-y-4">
        <Heading variant="small" title={t('Profile')} description={t('Update your profile photo, name, and email address')} />
        <Form {...ProfileController.update.form()} options={{ preserveScroll: true }} className="space-y-6">
          {({ processing, errors }) => (
            <><FormGroup errors={errors}
                fields={[
                  { id: 'avatar', name: 'avatar', label: t('Profile photo'), type: 'image', defaultValue: auth.user.avatar },
                  { id: 'name', name: 'name', label: t('Name'), type: 'text', placeholder: t('Full name'), defaultValue: auth.user.name },
                  { id: 'email', name: 'email', label: t('Email'), type: 'email', placeholder: t('Email address'), defaultValue: auth.user.email },
                ]}
              />
              {mustVerifyEmail && auth.user.email_verified_at === null && (
                <div>
                  <p className="-mt-4 text-sm text-muted-foreground">
                    {t('Your email address is unverified.')}{' '}
                    <Link href={send()} as="button" className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500">
                      {t('Click here to re-send the verification email.')}
                    </Link>
                  </p>
                  {status === 'verification-link-sent' && (
                    <div className="mt-2 text-sm font-medium text-green-600">
                      {t('A new verification link has been sent to your email address.')}
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center gap-4">
                <SmartButton type="submit" icon={Save} isLoading={processing} label={t('Save')} loadingLabel={t('Saving...')} data-test="update-profile-button" />
              </div>
            </>
          )}
        </Form>
      </div>
      <DeleteUser />
    </>
  )
}
Profile.layout = { breadcrumbs: [{ title: 'Profile settings', href: edit() }] }