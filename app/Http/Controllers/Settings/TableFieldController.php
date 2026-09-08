<?php
namespace App\Http\Controllers\Settings;
use App\Http\Controllers\Controller;
use App\Traits\{HasNotify, HasProtectedFields};
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\{RedirectResponse, Request};
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
class TableFieldController extends Controller
{
    use HasNotify, HasProtectedFields;
    private const TYPES = [
        'varchar' => 'string', 'text' => 'text', 'int' => 'integer', 'bigint' => 'bigInteger',
        'tinyint' => 'boolean', 'datetime' => 'datetime', 'date' => 'date', 'decimal' => 'decimal', 'json' => 'json',
    ];
    private function cleanName(string $table): string { return str_contains($table, '.') ? last(explode('.', $table)) : $table; }
    public function store(Request $request, string $table): RedirectResponse { return $this->persist($request, $table); }
    public function update(Request $request, string $table, string $field): RedirectResponse { return $this->persist($request, $table, $field); }
    private function persist(Request $request, string $table, ?string $currentField = null): RedirectResponse
    {
        $tableName = $this->cleanName($table);
        $validated = $request->validate([
            'name'           => ['required', 'string', 'alpha_dash', 'max:64'],
            'type'           => ['required', Rule::in(array_keys(self::TYPES))],
            'length'         => ['nullable', 'integer', 'min:1', 'max:255'],
            'default_value'  => ['nullable', 'string', 'max:255'],
            'comment'        => ['nullable', 'string', 'max:255'],
            'order'          => ['nullable', 'string', 'max:64'],
            'is_nullable'    => ['boolean'],
            'auto_increment' => ['boolean'],
            'is_unsigned'    => ['boolean'],
        ]);
        $fieldName = $currentField && $this->isProtectedField($tableName, $currentField) ? $currentField : strtolower(trim($validated['name']));
        if ((!$currentField || $currentField !== $fieldName) && Schema::hasColumn($tableName, $fieldName)) {
            $this->notify("Field '{$fieldName}' already exists.", 'error', 'name');
        }
        if ($this->isProtectedField($tableName, $currentField ?? $fieldName)) {
            $this->notify("Field '{$fieldName}' is protected.", 'error', 'name');
        }
        $fieldType   = self::TYPES[$validated['type']];
        $isAuto      = $request->boolean('auto_increment');
        $fieldLength = (int) ($validated['length'] ?? match ($fieldType) { 'string' => 50, 'integer', 'bigInteger', 'decimal' => 11, default => 0 });
        Schema::table($tableName, function (Blueprint $t) use ($request, $tableName, $fieldName, $fieldType, $fieldLength, $isAuto, $validated, $currentField) {
            $activeField = $currentField ?? $fieldName;
            $col = match (true) {
                $isAuto                 => $fieldType === 'bigInteger' ? $t->bigIncrements($activeField) : $t->increments($activeField),
                $fieldType === 'string'  => $t->string($activeField, $fieldLength),
                $fieldType === 'decimal' => $t->decimal($activeField, $fieldLength, 2),
                $fieldType === 'integer' => $t->integer($activeField),
                default                 => $t->{$fieldType}($activeField),
            };
            if ($request->boolean('is_unsigned') && !$isAuto && in_array($fieldType, ['integer', 'bigInteger', 'decimal'], true)) $col->unsigned();
            if ($request->boolean('is_nullable') && !$isAuto) $col->nullable();
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
        $action = $currentField ? 'updated' : 'created';
        return $this->notify("Field '{$fieldName}' {$action} successfully.");
    }
    public function destroy(string $table, string $field): RedirectResponse
    {
        $tableName = $this->cleanName($table);
        if ($this->isProtectedField($tableName, $field)) {
            return $this->notify("Field '{$field}' is protected and cannot be deleted.", 'error');
        }
        Schema::table($tableName, fn (Blueprint $t) => $t->dropColumn($field));
        return $this->notify("Field '{$field}' deleted successfully.");
    }
}