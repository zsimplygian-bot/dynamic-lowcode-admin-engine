<?php
namespace App\Traits;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

trait HasDynamicValidation
{
    use HasSchemaCache, InfersColumnDefinition;

    private const FIELD_PRESETS = [
        'dni'      => ['digits:8'],
        'phone'    => ['digits:9'],
        'telefono' => ['digits:9'],
        'celular'  => ['digits:9'],
        'email'    => ['string', 'email'],
        'correo'   => ['string', 'email'],
    ];

    private const TYPE_TO_RULE = [
        'number'   => 'numeric',
        'checkbox' => 'boolean',
        'date'     => 'date',
    ];

    public function validateDynamicData(Request $request, string $table, bool $isUpdate = false): array
    {
        $rules = Cache::rememberForever("schema_validation_rules_v2_{$table}", function () use ($table) {
            $compiled = [];
            foreach ($this->getTableColumns($table) as $column) {
                if (!empty($column['auto_increment'])) continue;

                $base = $this->buildBaseColumnDefinition($column, $table);
                $name = $base['name'];

                if ($this->isSystemColumn($name)) continue;

                $ruleType = self::TYPE_TO_RULE[$base['base_type']] ?? 'string';
                $columnRules = [
                    (!$base['is_nullable'] && $base['default'] === null) ? 'required' : 'nullable',
                    ...(self::FIELD_PRESETS[$name] ?? [$ruleType])
                ];

                if ($ruleType === 'string' && $base['ui_type'] !== 'file' && !str_contains($base['db_type'], 'text') && sscanf($base['db_type'], '%*[^0-9]%d', $length) === 1) {
                    $columnRules[] = "max:{$length}";
                }

                $compiled[$name] = $columnRules;
            }
            return $compiled;
        });

        if ($isUpdate) {
            $rules = array_intersect_key($rules, $request->all());
        }

        foreach ($request->allFiles() as $file => $_) {
            if (isset($rules[$file])) {
                $rules[$file] = [$isUpdate ? 'nullable' : 'required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'];
            }
        }

        return $request->validate($rules);
    }
}