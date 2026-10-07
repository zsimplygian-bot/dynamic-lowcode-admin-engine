<?php
namespace App\Http\Controllers;
use App\Traits\InfersColumnDefinition;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
class DynamicFormSchemaController extends Controller
{
    use InfersColumnDefinition;
    private const IMAGE_KEYWORDS = ['imagen', 'icon', 'logo', 'avatar', 'photo', 'foto'];
    private const FILE_KEYWORDS  = ['documento', 'comprobante', 'pdf', 'file', 'anexo', 'archivo'];
    private const EMAIL_KEYWORDS = ['email', 'correo'];
    private const PHONE_KEYWORDS = ['telefono', 'celular', 'phone', 'tel'];
    private const PASS_KEYWORDS  = ['password', 'contrasena', 'contraseña', 'clave_acceso', 'clave'];
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
    public function getTableSchema(string $table): array
    {
        $fields = [];
        $columns = Schema::getColumns($table);
        foreach ($columns as $col) {
            $base = $this->buildBaseColumnDefinition($col);
            $name = $base['name'];
            $isPrimary = $base['is_primary'] ?? false;
            $uiType = $this->resolveFormInputType($name, $base['base_type'], !empty($base['is_foreign']));
            $type = $isPrimary ? 'hidden' : $uiType;
            $label = $this->inferLabel($name, $base['comment'] ?? null) . ($type === 'checkbox' ? '?' : '');
            $fieldData = [
                'name'  => $name,
                'label' => $label,
                'type'  => $type,
            ];
            if (!empty($base['options'])) $fieldData['options'] = $base['options'];
            if (!($base['is_nullable'] ?? true) && !$isPrimary) $fieldData['required'] = true;
            if ($type === 'file') {
                $fieldData['accept'] = Str::contains($name, self::IMAGE_KEYWORDS) ? 'image/*' : '*/*';
            }
            $fields[] = $fieldData;
        }
        return $fields;
    }
    public function fields(string $table): JsonResponse { return response()->json($this->getTableSchema($table)); }
}