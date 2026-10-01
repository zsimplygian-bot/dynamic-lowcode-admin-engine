<?php
namespace App\Http\Controllers\Settings;
use App\Http\Controllers\Controller;
use App\Traits\{HasNotify, HasProtectedFields};
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Schema};
use Illuminate\Validation\Rule;
use Inertia\Inertia;
class TableFieldController extends Controller
{
    use HasNotify, HasProtectedFields;
    private function cleanName(string $table): string
    {
        return str_contains($table, '.') ? last(explode('.', $table)) : $table;
    }
    public function show(string $table)
    {
        $tableName = $this->cleanName($table);
        $foreignColumns = collect(Schema::getForeignKeys($tableName))->flatMap(fn ($fk) => $fk['columns'])->all();
        $tableFields = collect(Schema::getColumns($tableName))->map(function (array $col) use ($foreignColumns) {
            preg_match('/\((.*?)\)/', $col['type'], $match);
            $isEnum = $col['type_name'] === 'enum';
            $enumValues = $isEnum ? implode(', ', $this->parseEnumOptions($col['type'])) : null;
            return [
                'name'           => $col['name'],
                'type'           => $col['type_name'],
                'raw_type'       => $col['type'],
                'length'         => $isEnum ? $enumValues : (!empty($match[1]) ? (int) $match[1] : null),
                'is_nullable'    => $col['nullable'],
                'is_primary'     => $col['auto_increment'],
                'is_foreign'     => in_array($col['name'], $foreignColumns, true),
                'is_unsigned'    => str_contains(strtolower($col['type']), 'unsigned'),
                'default_value'  => $col['default'],
                'auto_increment' => $col['auto_increment'],
                'comment'        => $col['comment'],
            ];
        });
        return Inertia::render('settings/table-field', compact('tableName', 'tableFields'));
    }
    public function store(Request $request, string $table) { return $this->persist($request, $table); }
    public function update(Request $request, string $table, string $field) { return $this->persist($request, $table, $field); }
    private function persist(Request $request, string $table, ?string $currentField = null)
    {
        $tableName = $this->cleanName($table);
        $isForeign = $request->boolean('is_foreign');
        $isEnum    = $request->input('type') === 'enum';
        $data = $request->validate([
            'name'           => ['required', 'string', 'alpha_dash', 'max:64'],
            'type'           => [$isForeign ? 'nullable' : 'required', Rule::in([
                'varchar', 'text', 'enum', 'int', 'bigint', 'tinyint', 
                'datetime', 'datetime_local', 'timestamp', 'date', 'decimal', 'json'
            ])],
            'length'         => $isEnum
                ? ['required', 'string', 'max:255']
                : ['nullable', 'integer', 'min:1', 'max:255'],
            'default_value'  => ['nullable', 'max:255'],
            'comment'        => ['nullable', 'string', 'max:255'],
            'order'          => ['nullable', 'string', 'max:64'],
            'is_nullable'    => ['boolean'],
            'auto_increment' => ['boolean'],
            'is_unsigned'    => ['boolean'],
            'is_foreign'     => ['boolean'],
        ]);
        $fieldName = $currentField && $this->isProtectedField($tableName, $currentField) ? $currentField : strtolower(trim($data['name']));
        // 1. Defensa: Nombre y protección
        if ((!$currentField || $currentField !== $fieldName) && Schema::hasColumn($tableName, $fieldName)) {
            $this->notify("Field '{$fieldName}' already exists.", 'error', 'name');
        }
        //if ($this->isProtectedField($tableName, $currentField ?? $fieldName)) {
        //    $this->notify("Field '{$fieldName}' is protected.", 'error', 'name');
        //}
        // 2. Defensa: Claves Foráneas & Mapeo de Tipos (sin const TYPES)
        $foreignTable = null;
        $targetPk = null;
        if ($isForeign) {
            $foreignTable = str_starts_with($fieldName, 'id_') ? substr($fieldName, 3) : $fieldName;
            if (!Schema::hasTable($foreignTable)) {
                $this->notify("Table '{$foreignTable}' does not exist to establish a foreign key.", 'error', 'name');
            }
            $targetPk = Schema::hasColumn($foreignTable, "id_{$foreignTable}") ? "id_{$foreignTable}" : (Schema::hasColumn($foreignTable, 'id') ? 'id' : null);
            if (!$targetPk) {
                $this->notify("Table '{$foreignTable}' does not have a valid primary key ('id_{$foreignTable}' or 'id').", 'error', 'name');
            }
            $targetCol = collect(Schema::getColumns($foreignTable))->firstWhere('name', $targetPk);
            $isTargetBigInt = $targetCol && str_contains(strtolower($targetCol['type']), 'bigint');
            $fieldType = $isTargetBigInt ? 'bigInteger' : 'integer';
            $isUnsigned = true;
            $isAuto = false;
        } else {
            $fieldType = match ($data['type']) {
                'varchar'                    => 'string',
                'int'                        => 'integer',
                'bigint'                     => 'bigInteger',
                'tinyint'                    => 'boolean',
                'datetime', 'datetime_local' => 'dateTime',
                default                      => $data['type'],
            };
            $isAuto = $request->boolean('auto_increment');
            $isUnsigned = $request->boolean('is_unsigned');
        }
        $isNullable = $request->boolean('is_nullable');
        $defaultValue = filled($data['default_value'] ?? null) ? (string) $data['default_value'] : null;
        // 3. Defensa: Auto-Increment
        if ($isAuto) {
            if (!in_array($fieldType, ['integer', 'bigInteger'], true)) {
                $this->notify("Only integer fields (int/bigint) can be auto-increment.", 'error', 'auto_increment');
            }
            if ($isNullable) {
                $this->notify("Auto-increment fields cannot allow null values.", 'error', 'is_nullable');
            }
            if (filled($defaultValue)) {
                $this->notify("Auto-increment fields cannot have a default value.", 'error', 'default_value');
            }

            $existingAi = collect(Schema::getColumns($tableName))->first(fn ($c) => $c['auto_increment'] && $c['name'] !== $currentField);
            if ($existingAi) {
                $this->notify("The table already has an auto-increment field ('{$existingAi['name']}').", 'error', 'auto_increment');
            }
            $isUnsigned = true;
        }
        // 4. Defensa: Posición (order / AFTER)
        $order = $data['order'] ?? null;
        if (filled($order)) {
            if (strtoupper($order) !== 'FIRST' && !Schema::hasColumn($tableName, $order)) {
                $this->notify("The reference column '{$order}' specified in order does not exist.", 'error', 'order');
            }
            if ($order === $currentField || $order === $fieldName) {
                $this->notify("A column cannot be placed after itself.", 'error', 'order');
            }
        } elseif (!$currentField && Schema::hasColumn($tableName, 'creater_id')) {
            $cols = Schema::getColumnListing($tableName);
            $idx = array_search('creater_id', $cols, true);
            if ($idx > 0) $order = $cols[$idx - 1];
        }
        // 5. Defensa: ENUM y longitud
        $enumValues = [];
        $fieldLength = 50;
        if ($fieldType === 'enum') {
            $enumValues = array_values(array_filter(array_map('trim', explode(',', $data['length'] ?? ''))));
            if (empty($enumValues)) {
                $this->notify("You must enter at least one option for the enum field (comma-separated).", 'error', 'length');
            }
            if (filled($defaultValue) && !in_array($defaultValue, $enumValues, true)) {
                $this->notify("Default value '{$defaultValue}' is not one of the enum options.", 'error', 'default_value');
            }
        } elseif ($fieldType === 'string') {
            $fieldLength = max(1, min(255, (int) ($data['length'] ?? 50)));
        } else {
            $fieldLength = (int) ($data['length'] ?? match ($fieldType) { 'decimal' => 10, default => 0 });
        }
        // 6. Defensa: Valor por defecto numérico
        if (in_array($fieldType, ['integer', 'bigInteger', 'decimal'], true) && filled($defaultValue) && $defaultValue !== 'null' && !is_numeric($defaultValue)) {
            $this->notify("Default value for numeric fields must be a number.", 'error', 'default_value');
        }
        // 7. Migración en orden de registros ENUM (Ej: [1, 2] -> [3, 4])
        if ($currentField && $fieldType === 'enum' && Schema::hasColumn($tableName, $currentField)) {
            $existingCol = collect(Schema::getColumns($tableName))->firstWhere('name', $currentField);
            if ($existingCol && ($existingCol['type_name'] === 'enum' || str_contains(strtolower($existingCol['type']), 'enum'))) {
                $oldEnumValues = $this->parseEnumOptions($existingCol['type']);
                $cases = [];
                $bindings = [];
                $oldToMigrate = [];
                foreach ($oldEnumValues as $idx => $oldVal) {
                    if (isset($enumValues[$idx]) && $oldVal !== $enumValues[$idx]) {
                        $cases[] = "WHEN `{$currentField}` = ? THEN ?";
                        $bindings[] = $oldVal;
                        $bindings[] = $enumValues[$idx];
                        $oldToMigrate[] = $oldVal;
                    }
                }
                if (!empty($cases) && DB::table($tableName)->exists()) {
                    DB::statement("ALTER TABLE `{$tableName}` MODIFY `{$currentField}` VARCHAR(255) NULL");

                    $caseSql = implode(' ', $cases);
                    $inPlaceholders = implode(',', array_fill(0, count($oldToMigrate), '?'));
                    DB::statement(
                        "UPDATE `{$tableName}` SET `{$currentField}` = CASE {$caseSql} ELSE `{$currentField}` END WHERE `{$currentField}` IN ({$inPlaceholders})",
                        array_merge($bindings, $oldToMigrate)
                    );
                }
            }
        }
        // 8. Limpieza de nulos antes de cambiar a NOT NULL
        if ($currentField && !$isNullable && Schema::hasColumn($tableName, $currentField)) {
            $fallback = $defaultValue ?? match ($fieldType) {
                'integer', 'bigInteger', 'decimal', 'boolean' => '0',
                'enum' => $enumValues[0] ?? '',
                default => '',
            };
            if ($fallback !== 'null') {
                DB::table($tableName)->whereNull($currentField)->update([$currentField => $fallback]);
            }
        }
        // 9. Eliminar FK anterior si existía para evitar colisiones
        $this->dropForeignKeyIfExists($tableName, $currentField ?? $fieldName);
        // 10. Ejecución Blueprint
        Schema::table($tableName, function (Blueprint $t) use ($fieldName, $fieldType, $fieldLength, $enumValues, $isAuto, $isUnsigned, $isNullable, $defaultValue, $data, $order, $currentField) {
            $activeField = $currentField ?? $fieldName;
            $col = match (true) {
                $isAuto                   => $fieldType === 'bigInteger' ? $t->bigIncrements($activeField) : $t->increments($activeField),
                $fieldType === 'string'   => $t->string($activeField, $fieldLength),
                $fieldType === 'enum'     => $t->enum($activeField, $enumValues),
                $fieldType === 'decimal'  => $t->decimal($activeField, $fieldLength ?: 10, 2),
                default                   => $t->{$fieldType}($activeField),
            };
            if ($isUnsigned && !$isAuto && in_array($fieldType, ['integer', 'bigInteger', 'decimal'], true)) {
                $col->unsigned();
            }
            if (!$isAuto) {
                $col->nullable($isNullable);
                if (filled($defaultValue)) {
                    $col->default($defaultValue === 'null' ? null : $defaultValue);
                }
            }
            if (filled($data['comment'] ?? null)) {
                $col->comment($data['comment']);
            }
            if (filled($order)) {
                strtoupper($order) === 'FIRST' ? $col->first() : $col->after($order);
            }
            if ($currentField) {
                $col->change();
                if ($currentField !== $fieldName) {
                    $t->renameColumn($currentField, $fieldName);
                }
            }
        });
        // 11. Crear la relación FK
        if ($isForeign && $foreignTable && $targetPk) {
            Schema::table($tableName, function (Blueprint $t) use ($fieldName, $foreignTable, $targetPk) {
                try {
                    $t->foreign($fieldName)->references($targetPk)->on($foreignTable)->onDelete('cascade');
                } catch (\Throwable $e) {}
            });
        }
        $action = $currentField ? 'updated' : 'created';
        return $this->notify("Field '{$fieldName}' {$action} successfully.");
    }
    public function destroy(string $table, string $field)
    {
        $tableName = $this->cleanName($table);
        if ($this->isProtectedField($tableName, $field)) {
            return $this->notify("Field '{$field}' is protected and cannot be deleted.", 'error');
        }
        $this->dropForeignKeyIfExists($tableName, $field);
        Schema::table($tableName, fn (Blueprint $t) => $t->dropColumn($field));

        return $this->notify("Field '{$field}' deleted successfully.");
    }
    // Helper DRY para extraer opciones de un tipo crudo ENUM
    private function parseEnumOptions(string $rawType): array
    {
        preg_match('/\((.*?)\)/', $rawType, $match);
        return !empty($match[1]) ? array_map(fn($v) => trim($v, "'\" "), explode(',', $match[1])) : [];
    }
    // Helper DRY para eliminar claves foráneas asociadas a una columna
    private function dropForeignKeyIfExists(string $tableName, string $column): void
    {
        $foreignKeys = Schema::getForeignKeys($tableName);
        $realFkName  = collect($foreignKeys)->first(fn ($fk) => in_array($column, $fk['columns'], true))['name'] ?? null;
        if ($realFkName) {
            Schema::table($tableName, function (Blueprint $t) use ($realFkName) {
                try { $t->dropForeign($realFkName); } catch (\Throwable $e) {}
            });
        }
    }
}