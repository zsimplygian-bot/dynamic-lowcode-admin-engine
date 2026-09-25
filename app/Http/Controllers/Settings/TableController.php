<?php
namespace App\Http\Controllers\Settings;
use App\Http\Controllers\Controller;
use App\Traits\{HasNotify, HasProtectedTables};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Schema};
use Inertia\Inertia;
class TableController extends Controller
{
    use HasNotify, HasProtectedTables;
    public function index()
    {
        $dbTables = collect(Schema::getTables())
            ->reject(fn (array $table) => $this->isBlacklisted($table['name']))
            ->map(fn (array $table) => [
                'id'         => $table['name'],
                'name'       => $table['name'],
                'rows_count' => DB::table($table['name'])->count(),
                'size_mb'    => isset($table['size']) ? number_format($table['size'] / (1024 * 1024), 2) : '0.00',
            ])
            ->sortBy('name')
            ->values();
        return Inertia::render('settings/table', compact('dbTables'));
    }
    public function show(string $tableName)
    {
        $foreignColumns = collect(Schema::getForeignKeys($tableName))->flatMap(fn ($fk) => $fk['columns'])->all();
        $fieldsList = collect(Schema::getColumns($tableName))->map(function (array $col) use ($foreignColumns) {
            preg_match('/\((.*?)\)/', $col['type'], $match);
            return [
                'id'             => $col['name'],
                'name'           => $col['name'],
                'type'           => $col['type_name'],
                'raw_type'       => $col['type'],
                'length'         => isset($match[1]) ? (int) $match[1] : null,
                'is_nullable'    => $col['nullable'],
                'is_primary'     => $col['auto_increment'],
                'is_foreign'     => in_array($col['name'], $foreignColumns, true),
                'is_unsigned'    => str_contains(strtolower($col['type']), 'unsigned'),
                'default_value'  => $col['default'],
                'auto_increment' => $col['auto_increment'],
                'comment'        => $col['comment'],
            ];
        });
        return Inertia::render('settings/table-field', compact('tableName', 'fieldsList'));
    }
    public function store(Request $request) { return $this->persist($request); }
    public function update(Request $request, string $tableName) { return $this->persist($request, $tableName); }
    private function persist(Request $request, ?string $currentTableName = null)
    {
        $validated = $request->validate(['name' => ['required', 'string', 'alpha_dash', 'max:64']]);
        $newName   = strtolower(trim($validated['name']));
        if ($this->isBlacklisted($newName)) { $this->notify("The name '{$newName}' is reserved by the system.", 'error', 'name'); }
        if (($currentTableName !== $newName) && Schema::hasTable($newName)) {  $this->notify("Table '{$newName}' already exists.", 'error', 'name'); }
        if ($currentTableName) {
            if ($currentTableName !== $newName) {
                Schema::table($currentTableName, function ($table) use ($currentTableName, $newName) {
                    foreach (["id_{$currentTableName}" => "id_{$newName}", $currentTableName => $newName] as $from => $to) {
                        if (Schema::hasColumn($currentTableName, $from)) $table->renameColumn($from, $to);
                    }
                });
                Schema::rename($currentTableName, $newName);
            }
            return $this->notify("Table '{$newName}' updated successfully.");
        }
        Schema::create($newName, function ($table) use ($newName) {
            $table->increments("id_{$newName}");
            $table->string($newName, 50);
            $table->integer('creater_id')->unsigned();
            $table->integer('updater_id')->unsigned()->nullable();
            $table->timestamps();
        });
        return $this->notify("Table '{$newName}' created successfully.");
    }
    public function destroy(string $tableName)
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists($tableName);
        Schema::enableForeignKeyConstraints();
        return $this->notify("Table '{$tableName}' deleted successfully.");
    }
}