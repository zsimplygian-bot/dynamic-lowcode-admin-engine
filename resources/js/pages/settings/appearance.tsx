import { Form, Head, usePage } from '@inertiajs/react';
import { Save } from 'lucide-react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { SmartButton } from '@/components/smart-button';
import { FormGroup } from '@/components/form-group';
import { edit as editAppearance } from '@/routes/appearance';
import AppearanceController from '@/actions/App/Http/Controllers/Settings/AppearanceController';
type AppSettings = { app_name?: string; app_icon_url?: string; app_icon_thumb_url?: string };
type PageProps = { appSettings?: AppSettings };
export default function Appearance() {
    const { appSettings } = usePage<PageProps>().props;
    return (
        <>
            <Head {...{ title: "Appearance settings" }} />
            <div {...{ className: "space-y-6" }}>
                <Heading {...{ variant: "small", title: "Appearance", description: "Update the theme and application preferences" }} />
                <AppearanceTabs />
                <Form {...AppearanceController.update.form()} {...{ options: { preserveScroll: true }, className: "space-y-6" }}>
                    {({ processing, errors }) => (
                        <>
                            <FormGroup {...{ fields: [
                                    { id: 'app_name', label: 'App Title', defaultValue: appSettings?.app_name, placeholder: 'My Application', required: true },
                                    { id: 'app_icon', label: 'App Icon', type: 'file', accept: 'image/*', previewUrl: appSettings?.app_icon_thumb_url ?? appSettings?.app_icon_url, defaultValue: appSettings?.app_icon_url }
                                ], errors
                            }} />
                            <div {...{ className: "flex items-center gap-4" }}>
                                <SmartButton {...{ type: 'submit', icons: Save, isLoading: processing, label: 'Save', loadingLabel: 'Saving...', 'data-test': 'update-appearance-button' }} />
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
Appearance.layout = { breadcrumbs: [{ title: 'Appearance settings', href: editAppearance() }] };