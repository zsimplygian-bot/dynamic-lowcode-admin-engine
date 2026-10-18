<?php
namespace App\Http\Controllers\Settings;
use App\Http\Controllers\Controller;
use App\Traits\HasNotify;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Schema};
use Inertia\Inertia;
class TableFieldController extends Controller
{
    use HasNotify;
    private function cleanName(string $table): string { return str_contains($table, '.') ? last(explode('.', $table)) : $table; }
    private function isProtected(string $table, string $field): bool { return in_array($field, ['id', $table], true); }
    public function show(string $table)
    {
        $tableName = $this->cleanName($table);
        $tableFields = collect(Schema::getColumns($tableName))->map(function (array $col) {
            preg_match('/\((.*?)\)/', $col['type'], $m);
            $isEnum = $col['type_name'] === 'enum';
            return [
                'name'           => $col['name'],
                'type'           => $col['type_name'],
                'raw_type'       => $col['type'],
                'length'         => $isEnum ? implode(', ', $this->parseEnumOptions($col['type'])) : (!empty($m[1]) ? (int) $m[1] : null),
                'is_nullable'    => $col['nullable'],
                'is_primary'     => $col['auto_increment'],
                'is_unsigned'    => str_contains(strtolower($col['type']), 'unsigned'),
                'default_value'  => $col['default'],
                'auto_increment' => $col['auto_increment'],
                'comment'        => $col['comment'], ];
        });
        return Inertia::render('settings/table-field', compact('tableName', 'tableFields'));
    }
    public function store(Request $request, string $table) { return $this->persist($request, $table); }
    public function update(Request $request, string $table, string $field) { return $this->persist($request, $table, $field); }
    private function persist(Request $request, string $table, ?string $current = null)
    {
        $tableName = $this->cleanName($table);
        $isEnum = $request->input('type') === 'enum';
        $data = $request->validate([
            'name'           => 'required|string|alpha_dash|max:64',
            'type'           => 'required|in:varchar,text,enum,int,bigint,tinyint,datetime,datetime_local,timestamp,date,decimal,json',
            'length'         => $isEnum ? 'required|string|max:255' : 'nullable|integer|min:1|max:255',
            'default_value'  => 'nullable|max:255',
            'comment'        => 'nullable|string|max:255',
            'order'          => 'nullable|string|max:64',
            'is_nullable'    => 'boolean',
            'auto_increment' => 'boolean',
            'is_unsigned'    => 'boolean', ]);
        $name = $current && $this->isProtected($tableName, $current) ? $current : strtolower(trim($data['name']));
        if ((!$current || $current !== $name) && Schema::hasColumn($tableName, $name)) { return $this->notify("Field '{$name}' already exists.", 'error', 'name'); }
        $fieldType = match ($data['type']) {
            'varchar'                    => 'string',
            'int'                        => 'integer',
            'bigint'                     => 'bigInteger',
            'tinyint'                    => 'boolean',
            'datetime', 'datetime_local' => 'dateTime',
            default                      => $data['type'], };
        $isAuto = $request->boolean('auto_increment');
        $isUnsigned = $request->boolean('is_unsigned');
        $isNullable = $request->boolean('is_nullable');
        $default = filled($data['default_value'] ?? null) ? (string) $data['default_value'] : null;
        if ($isAuto) {
            if (!in_array($fieldType, ['integer', 'bigInteger'], true)) return $this->notify("Only int/bigint can be auto-increment.", 'error', 'auto_increment');
            if ($isNullable) return $this->notify("Auto-increment fields cannot allow null.", 'error', 'is_nullable');
            if (filled($default)) return $this->notify("Auto-increment fields cannot have default value.", 'error', 'default_value');
            if (collect(Schema::getColumns($tableName))->first(fn ($c) => $c['auto_increment'] && $c['name'] !== $current)) {
                return $this->notify("The table already has an auto-increment field.", 'error', 'auto_increment');
            }
            $isUnsigned = true;
        }
        $order = $data['order'] ?? null;
        if (filled($order)) {
            if (strtoupper($order) !== 'FIRST' && !Schema::hasColumn($tableName, $order)) return $this->notify("Reference column '{$order}' does not exist.", 'error', 'order');
            if ($order === $current || $order === $name) return $this->notify("A column cannot be placed after itself.", 'error', 'order');
        }
        $enumValues = [];
        if ($fieldType === 'enum') {
            $enumValues = array_values(array_filter(array_map('trim', explode(',', $data['length'] ?? ''))));
            if (empty($enumValues)) return $this->notify("Must provide at least one option for enum.", 'error', 'length');
            if (filled($default) && !in_array($default, $enumValues, true)) return $this->notify("Default value not in enum options.", 'error', 'default_value');
        }
        $fieldLen = $fieldType === 'string' ? max(1, min(255, (int) ($data['length'] ?? 50))) : (int) ($data['length'] ?? ($fieldType === 'decimal' ? 10 : 0));
        if (in_array($fieldType, ['integer', 'bigInteger', 'decimal'], true) && filled($default) && $default !== 'null' && !is_numeric($default)) {
            return $this->notify("Default value must be numeric.", 'error', 'default_value');
        }
        if ($current && $fieldType === 'enum' && Schema::hasColumn($tableName, $current)) {
            $col = collect(Schema::getColumns($tableName))->firstWhere('name', $current);
            if ($col && str_contains(strtolower($col['type']), 'enum')) {
                $cases = []; $bindings = []; $oldMigrate = [];
                foreach ($this->parseEnumOptions($col['type']) as $i => $old) {
                    if (isset($enumValues[$i]) && $old !== $enumValues[$i]) {
                        $cases[] = "WHEN `{$current}` = ? THEN ?";
                        array_push($bindings, $old, $enumValues[$i]);
                        $oldMigrate[] = $old;
                    }
                }
                if (!empty($cases) && DB::table($tableName)->exists()) {
                    DB::statement("ALTER TABLE `{$tableName}` MODIFY `{$current}` VARCHAR(255) NULL");
                    $inSql = implode(',', array_fill(0, count($oldMigrate), '?'));
                    DB::statement("UPDATE `{$tableName}` SET `{$current}` = CASE " . implode(' ', $cases) . " ELSE `{$current}` END WHERE `{$current}` IN ({$inSql})", array_merge($bindings, $oldMigrate));
                }
            }
        }
        if ($current && !$isNullable && Schema::hasColumn($tableName, $current)) {
            $fallback = $default ?? match ($fieldType) { 'integer', 'bigInteger', 'decimal', 'boolean' => '0', 'enum' => $enumValues[0] ?? '', default => '' };
            if ($fallback !== 'null') DB::table($tableName)->whereNull($current)->update([$current => $fallback]);
        }
        Schema::table($tableName, function (Blueprint $t) use ($name, $fieldType, $fieldLen, $enumValues, $isAuto, $isUnsigned, $isNullable, $default, $data, $order, $current) {
            $colName = $current ?? $name;
            $col = match (true) {
                $isAuto                  => $fieldType === 'bigInteger' ? $t->bigIncrements($colName) : $t->increments($colName),
                $fieldType === 'string'  => $t->string($colName, $fieldLen),
                $fieldType === 'enum'    => $t->enum($colName, $enumValues),
                $fieldType === 'decimal' => $t->decimal($colName, $fieldLen ?: 10, 2),
                default                  => $t->{$fieldType}($colName), };
            if ($isUnsigned && !$isAuto && in_array($fieldType, ['integer', 'bigInteger', 'decimal'], true)) $col->unsigned();
            if (!$isAuto) { $col->nullable($isNullable); if (filled($default)) $col->default($default === 'null' ? null : $default); }
            if (filled($data['comment'] ?? null)) $col->comment($data['comment']);
            if (filled($order)) (strtoupper($order) === 'FIRST' ? $col->first() : $col->after($order));
            if ($current) { $col->change(); if ($current !== $name) $t->renameColumn($current, $name); }
        }); return $this->notify("Field '{$name}' " . ($current ? 'updated' : 'created') . ' successfully.');
    }
    public function destroy(string $table, string $field)
    {
        $tableName = $this->cleanName($table);
        if ($this->isProtected($tableName, $field)) return $this->notify("Field '{$field}' is protected and cannot be deleted.", 'error');
        Schema::table($tableName, fn (Blueprint $t) => $t->dropColumn($field));
        return $this->notify("Field '{$field}' deleted successfully.");
    }
    private function parseEnumOptions(string $raw): array
    {
        preg_match('/\((.*?)\)/', $raw, $m);
        return !empty($m[1]) ? array_map(fn ($v) => trim($v, "'\" "), explode(',', $m[1])) : [];
    }
}