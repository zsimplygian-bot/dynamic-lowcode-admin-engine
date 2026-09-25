<?php
namespace App\Http\Controllers\Settings;
use App\Http\Controllers\Controller;
use App\Traits\{HasNotify, HasProtectedFields};
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\{RedirectResponse, Request};
use Illuminate\Support\Facades\{DB, Schema};
use Illuminate\Validation\Rule;
class TableFieldController extends Controller
{
    use HasNotify, HasProtectedFields;
    private const TYPES = [
        'varchar' => 'string', 'text' => 'text', 'enum' => 'enum', 'int' => 'integer', 'bigint' => 'bigInteger',
        'tinyint' => 'boolean', 'datetime' => 'datetime', 'date' => 'date', 'decimal' => 'decimal', 'json' => 'json',
    ];
    private function cleanName(string $table): string { return str_contains($table, '.') ? last(explode('.', $table)) : $table; }
    public function store(Request $request, string $table): RedirectResponse { return $this->persist($request, $table); }
    public function update(Request $request, string $table, string $field): RedirectResponse { return $this->persist($request, $table, $field); }
    private function persist(Request $request, string $table, ?string $currentField = null): RedirectResponse
    {
        $tableName = $this->cleanName($table);
        $isForeign = $request->boolean('is_foreign');
        $validated = $request->validate([
            'name'           => ['required', 'string', 'alpha_dash', 'max:64'],
            'type'           => [$isForeign ? 'nullable' : 'required', Rule::in(array_keys(self::TYPES))],
            'enum_values'    => ['nullable', 'required_if:type,enum', 'string', 'max:255'],
            'length'         => ['nullable', 'integer', 'min:1', 'max:255'],
            'default_value'  => ['nullable', 'string', 'max:255'],
            'comment'        => ['nullable', 'string', 'max:255'],
            'order'          => ['nullable', 'string', 'max:64'],
            'is_nullable'    => ['boolean'],
            'auto_increment' => ['boolean'],
            'is_unsigned'    => ['boolean'],
            'is_foreign'     => ['boolean'],
        ]);
        $fieldName = $currentField && $this->isProtectedField($tableName, $currentField) ? $currentField : strtolower(trim($validated['name']));
        if ((!$currentField || $currentField !== $fieldName) && Schema::hasColumn($tableName, $fieldName)) {
            $this->notify("Field '{$fieldName}' already exists.", 'error', 'name');
        }
        if ($this->isProtectedField($tableName, $currentField ?? $fieldName)) {
            $this->notify("Field '{$fieldName}' is protected.", 'error', 'name');
        }
        $foreignTable = null;
        if ($isForeign) {
            $selectedType = $validated['type'] ?? null;
            if ($selectedType && !in_array($selectedType, ['int', 'bigint'], true)) {
                $this->notify("El campo debe ser de tipo entero (int/bigint) para establecer una clave foránea.", 'error', 'type');
            }
            $foreignTable = str_starts_with($fieldName, 'id_') ? substr($fieldName, 3) : $fieldName;
            if (!Schema::hasTable($foreignTable)) {
                $this->notify("No hay una tabla válida '{$foreignTable}' para relacionar.", 'error', 'name');
            }
            $targetPk = "id_{$foreignTable}";
            if (!Schema::hasColumn($foreignTable, $targetPk)) {
                $this->notify("La tabla '{$foreignTable}' no posee una clave primaria válida ('{$targetPk}') para relacionar.", 'error', 'name');
            }
        }
        $fieldType   = $isForeign ? 'integer' : self::TYPES[$validated['type']];
        $isAuto      = !$isForeign && $request->boolean('auto_increment');
        $fieldLength = (int) ($validated['length'] ?? match ($fieldType) { 'string' => 50, 'integer', 'bigInteger', 'decimal' => 11, default => 0 });
        $isNullable  = $request->boolean('is_nullable');
        // Procesar valores enum
        $enumValues = [];
        if ($fieldType === 'enum' && filled($validated['enum_values'] ?? null)) {
            $enumValues = array_values(array_filter(array_map('trim', explode(',', $validated['enum_values']))));
            if (empty($enumValues)) {
                $this->notify("Debes ingresar al menos un valor válido para el campo enum.", 'error', 'enum_values');
            }
        }
        if ($currentField && !$isNullable) {
            $defaultValue = $validated['default_value'] ?? match ($fieldType) {
                'integer', 'bigInteger', 'decimal' => 0,
                'boolean' => 0,
                'enum' => $enumValues[0] ?? '',
                default => '',
            };
            DB::table($tableName)->whereNull($currentField)->update([$currentField => $defaultValue]);
        }
        $targetField = $currentField ?? $fieldName;
        $foreignKeys = Schema::getForeignKeys($tableName);
        $realFkName  = null;
        foreach ($foreignKeys as $fk) {
            if (in_array($targetField, $fk['columns'], true)) {
                $realFkName = $fk['name'];
                break;
            }
        }
        if ($realFkName) {
            Schema::table($tableName, function (Blueprint $t) use ($realFkName) {
                try { $t->dropForeign($realFkName); } catch (\Throwable $e) {}
            });
        }
        Schema::table($tableName, function (Blueprint $t) use ($request, $fieldName, $fieldType, $fieldLength, $enumValues, $isAuto, $validated, $currentField, $isNullable, $isForeign) {
            $activeField = $currentField ?? $fieldName;
            $col = match (true) {
                $isForeign               => $t->integer($activeField),
                $isAuto                  => $fieldType === 'bigInteger' ? $t->bigIncrements($activeField) : $t->increments($activeField),
                $fieldType === 'string'  => $t->string($activeField, $fieldLength),
                $fieldType === 'enum'    => $t->enum($activeField, $enumValues),
                $fieldType === 'decimal' => $t->decimal($activeField, $fieldLength, 2),
                $fieldType === 'integer' => $t->integer($activeField),
                default                  => $t->{$fieldType}($activeField),
            };
            if (!$isForeign && $request->boolean('is_unsigned') && !$isAuto && in_array($fieldType, ['integer', 'bigInteger', 'decimal'], true)) {
                $col->unsigned();
            }
            if (!$isAuto) $col->nullable($isNullable);
            if (filled($validated['default_value'] ?? null) && !$isAuto) $col->default($validated['default_value'] === 'null' ? null : $validated['default_value']);
            if (filled($validated['comment'] ?? null)) $col->comment($validated['comment']);
            if (filled($ord = $validated['order'] ?? null)) {
                strtoupper($ord) === 'FIRST' ? $col->first() : $col->after($ord);
            }
            if ($currentField) {
                $col->change();
                if ($currentField !== $fieldName) {
                    $t->renameColumn($currentField, $fieldName);
                }
            }
        });
        if ($isForeign && $foreignTable) {
            Schema::table($tableName, function (Blueprint $t) use ($fieldName, $foreignTable) {
                try {
                    $t->foreign($fieldName)->references("id_{$foreignTable}")->on($foreignTable)->onDelete('cascade');
                } catch (\Throwable $e) {}
            });
        }
        $action = $currentField ? 'updated' : 'created';
        return $this->notify("Field '{$fieldName}' {$action} successfully.");
    }
    public function destroy(string $table, string $field): RedirectResponse
    {
        $tableName = $this->cleanName($table);
        if ($this->isProtectedField($tableName, $field)) {
            return $this->notify("Field '{$field}' is protected and cannot be deleted.", 'error');
        }
        $foreignKeys = Schema::getForeignKeys($tableName);
        $realFkName  = null;
        foreach ($foreignKeys as $fk) {
            if (in_array($field, $fk['columns'], true)) {
                $realFkName = $fk['name'];
                break;
            }
        }
        Schema::table($tableName, function (Blueprint $t) use ($field, $realFkName) {
            if ($realFkName) {
                try { $t->dropForeign($realFkName); } catch (\Throwable $e) {}
            }
            $t->dropColumn($field);
        });
        return $this->notify("Field '{$field}' deleted successfully.");
    }
}