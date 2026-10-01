import { Form, Head, usePage, Link } from '@inertiajs/react'
import DeleteUser from '@/components/delete-user'
import Heading from '@/components/heading'
import { FormGroup } from '@/components/form-group'
import { SmartButton } from '@/components/smart-button'
import { useTranslation } from '@/hooks/use-translation'
import type { Auth } from '@/types'
type PageProps = { auth: Auth }
export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
  const t = useTranslation()
  const { auth } = usePage<PageProps>().props
  const fields = [ { id: 'avatar', name: 'avatar', label: t('Profile photo'), type: 'file', accept: 'image/*', defaultValue: auth.user.avatar },
                   { id: 'name', name: 'name', label: t('Name'), type: 'text', placeholder: t('Full name'), defaultValue: auth.user.name },
                   { id: 'email', name: 'email', label: t('Email'), type: 'email', placeholder: t('Email address'), defaultValue: auth.user.email }, ]
  return (
    <><Head title={t('Profile settings')} />
      <div className="space-y-4">
        <Heading variant="small" title={t('Profile')} description={t('Update your profile photo, name, and email address')} />
        <Form action="/settings/profile" method="post" options={{ preserveScroll: true }} className="space-y-4">
          {({ processing, errors }) => (
            <><FormGroup fields={fields} errors={errors} />
              {mustVerifyEmail && auth.user.email_verified_at === null && (
                <div>
                  <p className="-mt-4 text-sm text-muted-foreground">
                    {t('Your email address is unverified.')}{' '}
                    <Link href="/email/verification-notification" method="post" as="button" className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500">
                      {t('Click here to re-send the verification email.')}
                    </Link>
                  </p>
                  {status === 'verification-link-sent' && ( <div className="mt-2 text-sm font-medium text-green-600">{t('A new verification link has been sent to your email address.')}</div>
                  )}
                </div>
              )}
              <SmartButton type="submit" icon="save" isLoading={processing} label={t('Save')} loadingLabel={t('Saving...')} />
            </>
          )}
        </Form>
      </div>
      <DeleteUser />
    </>
  )
}
Profile.layout = { breadcrumbs: [{ title: 'Profile settings', href: '/settings/profile' }] }