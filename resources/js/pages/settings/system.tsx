import { Head, router } from '@inertiajs/react'
import { useState } from 'react'
import { toast } from 'sonner'
import Heading from '@/components/heading'
import { SmartButton } from '@/components/smart-button'
import { SmartCard } from '@/components/smart-card'
import { SmartForm } from '@/components/smart-form'

const t = (s: string) => s

const AI_TABLE_PROMPT = `Actúa como un arquitecto de bases de datos para mi motor dinámico Laravel/React/Inertia.
Genera únicamente la sentencia SQL CREATE TABLE para la entidad que te indique, respetando rigurosamente estas reglas:

Nombre de tabla: En minúsculas y siempre en singular (ej: paciente, cita, cliente).

Llave primaria: Debe ser id INT AUTO_INCREMENT PRIMARY KEY (usar siempre INT, nunca BIGINT).

Llaves foráneas: NUNCA crear restricciones de clave foránea (FOREIGN KEY / CONSTRAINT). Si una tabla hace referencia a otra, usa el formato nombretabla_id apuntando al id de la tabla correspondiente (ej: en mascota, la referencia a cliente será cliente_id INT).

Segundo campo obligatorio: El segundo campo de la tabla (inmediatamente después de id) debe tener exactamente el mismo nombre que la tabla (ej: en la tabla mascota, el segundo campo es mascota VARCHAR(...)).

Sin campos de auditoría: NO incluir created_at, updated_at, created_id, deleted_at ni ningún otro campo de auditoría/seguimiento, ya que esto se administra en una tabla audit independiente.

Tipos de datos: Compatibles con MySQL/MariaDB (VARCHAR, TEXT, INT, DECIMAL, BOOLEAN, DATE, DATETIME).

Comentario de tabla (Metadata UI): El comentario general de la tabla debe definir un icono de Lucide Icons y una clase de color de Tailwind CSS con el siguiente formato exacto: COMMENT='icon:\'nombre-icono\', color:\'bg-color-500\'' (ej: COMMENT='icon:\'dog\', color:\'bg-blue-500\'').

Comentarios de columnas: Incluir comentarios breves en las columnas para documentar su propósito si aplica, no poner comas ni comillas.`

export default function System() {
  const [clearing, setClearing] = useState(false)

  const handleClearGlobalCache = () => {
    setClearing(true)
    localStorage.clear()
    sessionStorage.clear()
    router.delete('/settings/system', {
      preserveScroll: true,
      onFinish: () => setClearing(false),
    })
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(AI_TABLE_PROMPT)
    toast.success(t('AI Prompt copied to clipboard!'))
  }

  const sqlFields = [
    { name: 'query', label: t('SQL QUERY'), type: 'textarea', placeholder: t('e.g. SELECT * FROM users WHERE active = 1;'), required: true },
  ]

  return (
    <>
      <Head title={t('System settings')} />
      <div className="space-y-4">
        <Heading variant="small" title={t('System settings')} description={t('Clear application cache, execute direct SQL queries, and manage system operations.')} />
        <SmartCard variant="destructive" icon="alert-triangle" title={t('Global cache wipe')} description={
          <>{t('This action will run')}{' '}<code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">php artisan optimize:clear</code>{' '}{t('on the server and clear local browser storage.')}</>
        }>
          <SmartButton variant="destructive" icon="trash-2" label={t('Clear cache')} loadingLabel={t('Clearing...')} isLoading={clearing} onClick={handleClearGlobalCache} confirmation />
        </SmartCard>
        <div className="border rounded-xl p-4 bg-card space-y-4">
          <div className="flex items-center justify-between gap-2">
            <Heading variant="small" title={t('Execute SQL Query')} description={t('Run direct raw SQL queries against the database.')} />
            <SmartButton variant="outline" size="sm" icon="sparkles" label={t('Copy AI Prompt')} onClick={handleCopyPrompt} tooltip={t('Copy prompt template for table generation')} />
          </div>
          <SmartForm action="/settings/system/query" mode="s" fields={sqlFields} />
        </div>
      </div>
    </>
  )
}
System.layout = { breadcrumbs: [{ title: 'System settings', href: '/settings/system' }] }