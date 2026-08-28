<?php

namespace App\Traits;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

trait HasDynamicValidation
{
    use HasSchemaCache, InfersColumnDefinition;

    private const VALIDATION_TYPE_LOOKUP = [
        'bigint'   => 'integer', 'integer' => 'integer', 'int' => 'integer', 'smallint' => 'integer', 'tinyint' => 'integer',
        'decimal'  => 'numeric', 'float'   => 'numeric', 'double' => 'numeric', 'numeric'  => 'numeric',
        'date'     => 'date',    'datetime' => 'date',   'timestamp' => 'date', 'time'     => 'date',
        'boolean'  => 'boolean',
    ];

    private const FIELD_PRESETS = [
        'dni'   => ['digits:8'],
        'phone' => ['digits:9'],
        'email' => ['string', 'email'],
    ];

    private const FIELD_ALIASES = [
        'telefono' => 'phone', 'celular' => 'phone', 'correo' => 'email',
    ];

    protected function validateDynamicData(Request $request, string $tabla, bool $isUpdate = false): array
    {
        $rules = $this->getDynamicRules($tabla, $isUpdate);

        // Si es actualización, solo validamos los campos enviados en el request
        if ($isUpdate) {
            $rules = array_intersect_key($rules, $request->all());
        }

        // Detección corregida de subida de archivos
        $files = $request->allFiles();
        if (!empty($files)) {
            foreach ($files as $fileName => $file) {
                if (isset($rules[$fileName])) {
                    $baseReq = $rules[$fileName][0] ?? ($isUpdate ? 'nullable' : 'required');
                    $rules[$fileName] = [$baseReq, 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'];
                }
            }
        }

        return $request->validate($rules);
    }

    public function getDynamicRules(string $tabla, bool $isUpdate): array
    {
        $cacheKey = "compiled_rules_{$tabla}_" . ($isUpdate ? 'update' : 'create');

        return Cache::rememberForever($cacheKey, function () use ($tabla, $isUpdate) {
            $columns = $this->getRawTableColumns($tabla);
            if (empty($columns)) return [];

            $pkField = 'id_' . strtolower($tabla);
            $rules   = [];

            foreach ($columns as $column) {
                if (!empty($column['auto_increment'])) continue;

                $name = strtolower($column['name'] ?? '');
                
                // Usamos la lista centralizada de columnas de auditoría/sistema
                if ($this->isSystemColumn($name, $pkField)) continue;

                $isNullable = (bool) ($column['nullable'] ?? false);
                $hasDefault = ($column['default'] ?? null) !== null;

                $baseReq = (!$isNullable && !$hasDefault)
                    ? ($isUpdate ? 'sometimes' : 'required')
                    : 'nullable';

                $presetKey = self::FIELD_ALIASES[$name] ?? $name;
                $typeName  = strtolower($column['type_name'] ?? '');
                $fullType  = $column['type'] ?? '';

                $ruleType = ($typeName === 'tinyint' && str_contains($fullType, 'tinyint(1)'))
                    ? 'boolean'
                    : (self::VALIDATION_TYPE_LOOKUP[$typeName] ?? 'string');

                $columnRules = [$baseReq];

                // Presets específicos (DNI, Teléfono, Correo)
                if (isset(self::FIELD_PRESETS[$presetKey])) {
                    $columnRules = array_merge($columnRules, self::FIELD_PRESETS[$presetKey]);
                } else {
                    $columnRules[] = $ruleType;
                }

                // Longitud máxima para strings (varchar)
                if ($ruleType === 'string' && !str_contains($typeName, 'text')) {
                    if (sscanf($fullType, '%*[^0-9]%d', $length) === 1 && $length > 0) {
                        $columnRules[] = "max:{$length}";
                    }
                }

                $rules[$name] = $columnRules;
            }

            return $rules;
        });
    }
}