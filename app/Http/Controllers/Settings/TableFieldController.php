<?php
namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Traits\HasInertiaNotifications;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class TableFieldController extends Controller
{
    use HasInertiaNotifications;

    private const TYPE_MAP = [
        'varchar'  => 'string',
        'text'     => 'text',
        'int'      => 'integer',
        'bigint'   => 'bigInteger',
        'tinyint'  => 'boolean',
        'datetime' => 'datetime',
        'date'     => 'date',
        'decimal'  => 'decimal',
        'json'     => 'json',
    ];

    private function cleanName(string $name): string
    {
        return str_contains($name, '.') ? last(explode('.', $name)) : $name;
    }

    public function store(Request $request, string $table): RedirectResponse
    {
        return $this->persist($request, $table);
    }

    public function update(Request $request, string $table, string $field): RedirectResponse
    {
        return $this->persist($request, $table, $field);
    }

    private function persist(Request $request, string $table, ?string $currentField = null): RedirectResponse
    {
        $cleanTable = $this->cleanName($table);

        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:64', 'regex:/^[a-zA-Z_][a-zA-Z0-9_]*$/'],
            'type'          => ['required', 'string', 'in:' . implode(',', array_keys(self::TYPE_MAP))],
            'default_value' => ['nullable', 'string', 'max:255'],
            'comment'       => ['nullable', 'string', 'max:255'],
            'order'         => ['nullable', 'string', 'max:64'],
        ]);

        $columnName      = $validated['name'];
        $typeMethod      = self::TYPE_MAP[$validated['type']] ?? 'string';
        $isNullable      = $request->boolean('is_nullable');
        $isAutoIncrement = $request->boolean('auto_increment');
        $defaultValue    = $validated['default_value'] ?? null;
        $comment         = $validated['comment'] ?? null;
        $orderColumn     = $validated['order'] ?? null;

        $buildColumn = function (Blueprint $t) use ($cleanTable, $columnName, $typeMethod, $isNullable, $defaultValue, $comment, $isAutoIncrement, $orderColumn) {
            $column = $isAutoIncrement && in_array($typeMethod, ['integer', 'bigInteger'])
                ? $t->{$typeMethod === 'bigInteger' ? 'bigIncrements' : 'increments'}($columnName)
                : $t->{$typeMethod}($columnName);

            if ($isNullable && !$isAutoIncrement) $column->nullable();
            if ($defaultValue !== null && !$isAutoIncrement) $column->default($defaultValue === 'null' ? null : $defaultValue);
            if ($comment !== null) $column->comment($comment);

            // Modificador de posición (MySQL)
            if ($orderColumn !== null) {
                if (strtoupper($orderColumn) === 'FIRST') {
                    $column->first();
                } elseif (Schema::hasColumn($cleanTable, $orderColumn)) {
                    $column->after($orderColumn);
                }
            }

            return $column;
        };

        // MODO EDICIÓN
        if ($currentField) {
            abort_unless(Schema::hasColumn($cleanTable, $currentField), 404, 'El campo no existe.');

            if ($currentField !== $columnName && Schema::hasColumn($cleanTable, $columnName)) {
                return back()->withErrors(['name' => "La columna '{$columnName}' ya existe."]);
            }

            if ($currentField !== $columnName) {
                Schema::table($cleanTable, fn (Blueprint $t) => $t->renameColumn($currentField, $columnName));
            }

            Schema::table($cleanTable, fn (Blueprint $t) => $buildColumn($t)->change());

            return $this->notifyAndRedirect("Campo '{$columnName}' actualizado con éxito.");
        }

        // MODO CREACIÓN
        if (Schema::hasColumn($cleanTable, $columnName)) {
            return back()->withErrors(['name' => "La columna '{$columnName}' ya existe."]);
        }

        Schema::table($cleanTable, fn (Blueprint $t) => $buildColumn($t));

        return $this->notifyAndRedirect("Campo '{$columnName}' creado con éxito.");
    }

    public function destroy(string $table, string $field): RedirectResponse
    {
        $cleanTable = $this->cleanName($table);

        if (Schema::hasTable($cleanTable) && Schema::hasColumn($cleanTable, $field)) {
            Schema::table($cleanTable, fn (Blueprint $t) => $t->dropColumn($field));
            return $this->notifyAndRedirect("Campo '{$field}' eliminado correctamente.");
        }

        return $this->notifyAndRedirect("El campo o la tabla especificada no existe.", 'error');
    }
}