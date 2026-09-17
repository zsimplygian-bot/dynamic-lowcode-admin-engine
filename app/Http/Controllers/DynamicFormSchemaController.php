<?php
namespace App\Http\Controllers;
use App\Traits\HasSchemaCache;
use App\Traits\InfersColumnDefinition;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
class DynamicFormSchemaController extends Controller
{
    use HasSchemaCache, InfersColumnDefinition;
    private const IGNORED_FIELDS = ['created_at', 'updated_at', 'creater_id', 'updater_id', 'remember_token'];
    private const IMAGE_KEYWORDS = ['imagen', 'icon', 'logo', 'avatar', 'photo', 'foto', 'archivo',];
    private const FILE_KEYWORDS  = [ 'documento', 'comprobante', 'pdf', 'file', 'anexo'];
    private const EMAIL_KEYWORDS = ['email', 'correo'];
    private const PHONE_KEYWORDS = ['telefono', 'celular', 'phone', 'tel'];
    private const PASS_KEYWORDS  = ['password', 'contrasena', 'contraseña', 'clave_acceso', 'clave'];
    public function getTableSchema(string $table): array
    {
        return Cache::rememberForever("schema_form_fields_v1_{$table}", function () use ($table) {
            $fields = [];
            foreach ($this->getTableColumns($table) as $col) {
                $base = $this->buildBaseColumnDefinition($col, $table);
                $name = $base['name'];
                if (in_array($name, self::IGNORED_FIELDS, true)) continue;
                $isPrimary = $base['is_primary'];
                $type = $isPrimary ? 'hidden' : $this->resolveFormInputType($name, $base['type'], $base['is_foreign']);
                $label = $base['label'] . ($type === 'checkbox' ? '?' : '');
                $fieldData = [
                    'name'  => $name,
                    'label' => $label,
                    'type'  => $type,
                ];
                if (!$base['is_nullable'] && !$isPrimary) $fieldData['required'] = true;
                if ($type === 'file') {
                    $fieldData['accept'] = Str::contains($name, self::IMAGE_KEYWORDS) ? 'image/*' : '*/*';
                }
                $fields[] = $fieldData;
            }
            return $fields;
        });
    }
    private function resolveFormInputType(string $name, string $baseType, bool $isForeign): string
    {
        if ($isForeign) return 'select';
        if (Str::contains($name, array_merge(self::IMAGE_KEYWORDS, self::FILE_KEYWORDS))) return 'file';
        if ($baseType === 'text' || $baseType === 'textarea') {
            if (Str::contains($name, self::EMAIL_KEYWORDS)) return 'email';
            if (Str::contains($name, self::PHONE_KEYWORDS)) return 'tel';
            if (Str::contains($name, self::PASS_KEYWORDS)) return 'password';
        }
        return $baseType;
    }
    public function fields(string $table): JsonResponse { return response()->json($this->getTableSchema($table)); }
}