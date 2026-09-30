<?php

namespace App\Services;

use App\Traits\HasSchemaCache;
use App\Traits\InfersColumnDefinition;
use App\Traits\HasNotify;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DynamicValidationService
{
    use HasSchemaCache, InfersColumnDefinition, HasNotify;

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

    public function validate(Request $request, string $table, bool $isUpdate = false): array
    {
        $rules = Cache::rememberForever("schema_validation_rules_v2_{$table}", function () use ($table) {
            $compiled = [];
            foreach ($this->getTableColumns($table) as $column) {
                if (!empty($column['auto_increment'])) continue;

                $base = $this->buildBaseColumnDefinition($column, $table);
                $name = $base['name'];

                if ($this->isSystemColumn($name)) continue;

                $columnRules = [
                    (!$base['is_nullable'] && $base['default'] === null) ? 'required' : 'nullable',
                ];

                if (!empty($base['options'])) {
                    $allowedValues = array_column($base['options'], 'id');
                    $columnRules[] = 'in:' . implode(',', $allowedValues);
                } else {
                    $ruleType = str_starts_with($name, 'id_') 
                        ? 'numeric' 
                        : (self::TYPE_TO_RULE[$base['base_type']] ?? 'string');

                    array_push($columnRules, ...(self::FIELD_PRESETS[$name] ?? [$ruleType]));

                    if ($ruleType === 'string' && $base['ui_type'] !== 'file' && !str_contains($base['db_type'], 'text')) {
                        if (sscanf($base['db_type'], '%*[^0-9]%d', $length) === 1 && $length > 0) {
                            $columnRules[] = "max:{$length}";
                        }
                    }
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

        $validated = $request->validate($rules);
        $this->applyBusinessRules($table, $validated, $isUpdate);

        return $validated;
    }

    private function applyBusinessRules(string $table, array $data, bool $isUpdate): void
    {
        switch ($table) {
            case 'cita':
                if (isset($data['fecha']) && Carbon::parse($data['fecha'])->isPast()) {
                    $this->notify('La fecha de la cita no puede ser inferior a la actual.', 'error', 'fecha');
                }
                break;
        }
    }
}