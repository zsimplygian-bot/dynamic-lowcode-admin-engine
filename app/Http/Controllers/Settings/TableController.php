<?php
namespace App\Http\Controllers\Settings;
use App\Http\Controllers\Controller;
use App\Traits\HasInertiaNotifications;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
class TableController extends Controller
{
    use HasInertiaNotifications;
    public function index(): Response
    {
        $dbTables = DB::table('information_schema.tables')
            ->where('table_schema', DB::getDatabaseName())
            ->where('table_type', 'BASE TABLE')
            ->orderBy('table_name')
            ->get(['table_name as id', 'table_name as name', DB::raw('COALESCE(table_rows, 0) as rows_count')]);
        return Inertia::render('settings/tables', compact('dbTables'));
    }
    public function show(string $table): Response
    {
        $primaryKeys = collect(Schema::getIndexes($table))
            ->firstWhere('primary')['columns'] ?? [];

        $fieldsList = collect(Schema::getColumns($table))->map(fn (array $col) => [
            'id' => $col['name'],
            'name' => $col['name'],
            'type' => $col['type_name'],
            'raw_type' => $col['type'],
            'is_nullable' => $col['nullable'],
            'is_primary' => in_array($col['name'], $primaryKeys),
            'default_value' => $col['default'],
            'auto_increment' => $col['auto_increment'],
            'comment' => $col['comment'],
        ]);

        return Inertia::render('settings/tables-fields', [
            'tableName' => $table, 
            'fieldsList' => $fieldsList,
        ]);
    }
    public function store(Request $request): RedirectResponse
    {
        return $this->persist($request);
    }
    public function update(Request $request, string $table): RedirectResponse
    {
        return $this->persist($request, $table);
    }
    private function persist(Request $request, ?string $currentTable = null): RedirectResponse
    {
        $newName = strtolower($request->input('name'));
        if ($currentTable) {
            if ($currentTable !== $newName) {
                Schema::rename($currentTable, $newName);
            }
            return $this->notifyAndRedirect("Tabla renombrada a '{$newName}' correctamente.", 'success', 'tables.index');
        }
        Schema::create($newName, function ($table) use ($newName) {
            $table->integer("id_{$newName}")->autoIncrement()->primary();
            $table->string($newName, 50);
            $table->integer('creater_id');
            $table->integer('updater_id')->nullable();
            $table->dateTime('created_at');
            $table->dateTime('updated_at')->nullable();
        });
        return $this->notifyAndRedirect("Tabla '{$newName}' creada con éxito.", 'success', 'tables.index');
    }
    public function destroy(string $table): RedirectResponse
    {
        if (Schema::hasTable($table)) {
            Schema::disableForeignKeyConstraints();
            Schema::dropIfExists($table);
            Schema::enableForeignKeyConstraints();
            return $this->notifyAndRedirect("Tabla '{$table}' eliminada correctamente.", 'success', 'tables.index');
        }
        return $this->notifyAndRedirect("La tabla especificada no existe.", 'error', 'tables.index');
    }
}