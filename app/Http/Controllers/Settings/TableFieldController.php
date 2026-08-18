<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class TableFieldController extends Controller
{
    private function cleanName(string $name): string
    {
        return str_contains($name, '.') ? last(explode('.', $name)) : $name;
    }

    public function store(Request $request, string $table): RedirectResponse
    {
        $cleanTable = $this->cleanName($table);
        abort_unless(Schema::hasTable($cleanTable), 404, 'La tabla no existe.');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:64', 'regex:/^[a-zA-Z_][a-zA-Z0-9_]*$/'],
            'type' => ['required', 'string', 'in:string,integer,bigInteger,text,boolean,date,datetime,timestamp,decimal,float,json'],
            'nullable' => ['nullable', 'boolean'],
        ]);

        $columnName = $validated['name'];
        $type = $validated['type'];
        $isNullable = $request->boolean('nullable');

        if (Schema::hasColumn($cleanTable, $columnName)) {
            return back()->withErrors(['name' => "La columna '{$columnName}' ya existe en la tabla."]);
        }

        Schema::table($cleanTable, function ($t) use ($columnName, $type, $isNullable) {
            $column = $t->$type($columnName);
            if ($isNullable) {
                $column->nullable();
            }
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Campo '{$columnName}' creado con éxito.",
        ]);

        return back();
    }

    public function update(Request $request, string $table, string $field): RedirectResponse
    {
        $cleanTable = $this->cleanName($table);
        abort_unless(Schema::hasTable($cleanTable), 404, 'La tabla no existe.');
        abort_unless(Schema::hasColumn($cleanTable, $field), 404, 'El campo no existe.');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:64', 'regex:/^[a-zA-Z_][a-zA-Z0-9_]*$/'],
        ]);

        $newName = $validated['name'];

        if ($field !== $newName) {
            Schema::table($cleanTable, function ($t) use ($field, $newName) {
                $t->renameColumn($field, $newName);
            });
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Campo renombrado a '{$newName}' correctamente.",
        ]);

        return back();
    }

    public function destroy(string $table, string $field): RedirectResponse
    {
        $cleanTable = $this->cleanName($table);
        
        if (Schema::hasTable($cleanTable) && Schema::hasColumn($cleanTable, $field)) {
            Schema::table($cleanTable, function ($t) use ($field) {
                $t->dropColumn($field);
            });

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => "Campo '{$field}' eliminado correctamente.",
            ]);
        }

        return back();
    }

    /**
     * Reordena físicamente las columnas en la base de datos MySQL/MariaDB.
     */
    public function reorder(Request $request, string $table): RedirectResponse
{
    $cleanTable = $this->cleanName($table);
    abort_unless(Schema::hasTable($cleanTable), 404, 'La tabla no existe.');

    $validated = $request->validate([
        'fields' => ['required', 'array'],
        'fields.*' => ['required', 'string'],
    ]);

    $orderedFields = $validated['fields'];
    $driver = DB::getDriverName();

    if (in_array($driver, ['mysql', 'mariadb'])) {
        foreach ($orderedFields as $index => $fieldName) {
            if (!Schema::hasColumn($cleanTable, $fieldName)) {
                continue;
            }

            $columnInfo = DB::selectOne("
                SELECT COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = ? 
                  AND COLUMN_NAME = ?
            ", [$cleanTable, $fieldName]);

            if (!$columnInfo) {
                continue;
            }

            $nullableSql = $columnInfo->IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
            $defaultSql = '';
            if ($columnInfo->COLUMN_DEFAULT !== null) {
                $defaultSql = "DEFAULT '" . addslashes($columnInfo->COLUMN_DEFAULT) . "'";
            }

            $positionSql = ($index === 0) 
                ? 'FIRST' 
                : "AFTER `{$orderedFields[$index - 1]}`";

            DB::statement("
                ALTER TABLE `{$cleanTable}` 
                MODIFY COLUMN `{$fieldName}` {$columnInfo->COLUMN_TYPE} {$nullableSql} {$defaultSql} {$positionSql}
            ");
        }
    }

    Inertia::flash('toast', [
        'type' => 'success',
        'message' => 'Orden de columnas guardado con éxito en la base de datos.',
    ]);

    return back();
}
}