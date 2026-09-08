<?php
namespace App\Traits;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
trait HasDynamicValidation
{
    use HasSchemaCache, InfersColumnDefinition;
    private const VALIDATION_TYPE_LOOKUP = [
        'bigint' => 'integer', 'integer' => 'integer', 'int' => 'integer', 'smallint' => 'integer', 'tinyint' => 'integer',
        'decimal' => 'numeric', 'float' => 'numeric', 'double' => 'numeric', 'numeric' => 'numeric',
        'date' => 'date', 'datetime' => 'date', 'timestamp' => 'date', 'time' => 'date',
        'boolean' => 'boolean',
    ];
    private const FIELD_PRESETS = [
        'dni' => ['digits:8'],
        'phone' => ['digits:9'],
        'email' => ['string', 'email'],
    ];
    private const FIELD_ALIASES = [
        'telefono' => 'phone', 'celular' => 'phone', 'correo' => 'email',
    ];
    protected function validateDynamicData(Request $request, string $tabla, bool $isUpdate = false): array
    {
        $rules = $this->getDynamicRules($tabla);
        // Si es update, solo evaluamos los campos presentes en el request
        if ($isUpdate) {
            $rules = array_intersect_key($rules, $request->all());
        }
        // Inyección directa de archivos sin tocar caché base
        foreach ($request->allFiles() as $fileName => $file) {
            if (isset($rules[$fileName])) {
                $rules[$fileName] = [$isUpdate ? 'nullable' : 'required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'];
            }
        }
        return $request->validate($rules);
    }
    public function getDynamicRules(string $tabla): array
    {
        return Cache::rememberForever("compiled_rules_{$tabla}", function () use ($tabla) {
            $columns = $this->getRawTableColumns($tabla);
            if (empty($columns)) return [];
            $pkField = 'id_' . strtolower($tabla);
            $rules = [];
            foreach ($columns as $column) {
                if (!empty($column['auto_increment'])) continue;
                $name = strtolower($column['name'] ?? '');
                if ($this->isSystemColumn($name, $pkField)) continue;
                $isNullable = (bool) ($column['nullable'] ?? false);
                $hasDefault = ($column['default'] ?? null) !== null;
                // Regla base
                $columnRules = [(!$isNullable && !$hasDefault) ? 'required' : 'nullable'];
                $presetKey = self::FIELD_ALIASES[$name] ?? $name;
                $typeName = strtolower($column['type_name'] ?? '');
                $fullType = $column['type'] ?? '';
                $ruleType = ($typeName === 'tinyint' && str_contains($fullType, 'tinyint(1)'))
                    ? 'boolean'
                    : (self::VALIDATION_TYPE_LOOKUP[$typeName] ?? 'string');
                // Presets o Tipo base
                if (isset(self::FIELD_PRESETS[$presetKey])) {
                    array_push($columnRules, ...self::FIELD_PRESETS[$presetKey]);
                } else {
                    $columnRules[] = $ruleType;
                }
                // Max length directo
                if ($ruleType === 'string' && !str_contains($typeName, 'text') && sscanf($fullType, '%*[^0-9]%d', $length) === 1) {
                    $columnRules[] = "max:{$length}";
                }
                $rules[$name] = $columnRules;
            }
            return $rules;
        });
    }
}