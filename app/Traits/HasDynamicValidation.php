<?php

namespace App\Traits;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

trait HasDynamicValidation
{
    use HasSchemaCache;

    private const TYPE_LOOKUP = [
        'bigint' => 'integer', 'integer' => 'integer', 'int' => 'integer', 'smallint' => 'integer', 'tinyint' => 'integer',
        'decimal' => 'numeric', 'float' => 'numeric', 'double' => 'numeric', 'numeric' => 'numeric',
        'date' => 'date', 'datetime' => 'date', 'timestamp' => 'date', 'time' => 'date',
        'boolean' => 'boolean',
    ];

    private const IGNORED_FIELDS = [
        'id' => true, 'created_at' => true, 'updated_at' => true, 'creater_id' => true, 'updater_id' => true,
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

        if ($isUpdate) {
            $rules = array_intersect_key($rules, $request->all());
        }

        if ($request->hasFile('*')) {
            foreach ($request->allFiles() as $fileName => $file) {
                if (isset($rules[$fileName])) {
                    $baseReq = $rules[$fileName][0] ?? 'nullable';
                    $rules[$fileName] = [$baseReq, 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'];
                }
            }
        }

        return $request->validate($rules);
    }

    private function getDynamicRules(string $tabla, bool $isUpdate): array
    {
        $cacheKey = "compiled_rules_{$tabla}_" . ($isUpdate ? 'update' : 'create');

        // Retorna las reglas ya procesadas directamente desde el caché persistente
        return Cache::rememberForever($cacheKey, function () use ($tabla, $isUpdate) {
            $columns = $this->getRawTableColumns($tabla);
            if (empty($columns)) return [];

            $pkField = 'id_' . strtolower($tabla);
            $rules = [];

            foreach ($columns as $column) {
                if (!empty($column['auto_increment'])) continue;

                $name = strtolower($column['name']);
                if (isset(self::IGNORED_FIELDS[$name]) || $name === $pkField) continue;

                $baseReq = (!($column['nullable'] ?? false) && $column['default'] === null)
                    ? ($isUpdate ? 'sometimes' : 'required')
                    : 'nullable';

                $presetKey = self::FIELD_ALIASES[$name] ?? $name;
                $typeName = strtolower($column['type_name'] ?? '');
                $fullType = $column['type'] ?? '';

                $ruleType = ($typeName === 'tinyint' && str_contains($fullType, 'tinyint(1)'))
                    ? 'boolean'
                    : (self::TYPE_LOOKUP[$typeName] ?? 'string');

                $columnRules = [$baseReq];

                if (isset(self::FIELD_PRESETS[$presetKey])) {
                    $columnRules = array_merge($columnRules, self::FIELD_PRESETS[$presetKey]);
                } else {
                    $columnRules[] = $ruleType;
                }

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