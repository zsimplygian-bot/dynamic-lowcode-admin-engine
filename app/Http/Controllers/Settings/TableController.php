<?php
namespace App\Http\Controllers\Settings;
use App\Http\Controllers\Controller;
use App\Traits\HasInertiaNotifications;
use Illuminate\Http\{RedirectResponse, Request};
use Illuminate\Support\Facades\{DB, Schema};
use Inertia\{Inertia, Response};
class TableController extends Controller
{
    use HasInertiaNotifications;
    public function index(): Response
    {
        $dbTables = collect(Schema::getTables())
            ->map(fn (array $table) => [
                'id'         => $table['name'],
                'name'       => $table['name'],
                'rows_count' => DB::table($table['name'])->count(),
                'size_mb'    => isset($table['size']) ? number_format($table['size'] / (1024 * 1024), 2) : '0.00',
            ])
            ->sortBy('name')
            ->values();

        return Inertia::render('settings/tables', compact('dbTables'));
    }
    public function show(string $tableName): Response
    {
        $primaryKeys = collect(Schema::getIndexes($tableName)) ->firstWhere('primary')['columns'] ?? [];
        $fieldsList = collect(Schema::getColumns($tableName))->map(fn (array $col) => [
            'id'             => $col['name'],
            'name'           => $col['name'],
            'type'           => $col['type_name'],
            'raw_type'       => $col['type'],
            'is_nullable'    => $col['nullable'],
            'is_primary'     => in_array($col['name'], $primaryKeys),
            'default_value'  => $col['default'],
            'auto_increment' => $col['auto_increment'],
            'comment'        => $col['comment'],
        ]);
        return Inertia::render('settings/tables-fields', compact('tableName', 'fieldsList'));
    }
    public function store(Request $request): RedirectResponse { return $this->persist($request); }
    public function update(Request $request, string $tableName): RedirectResponse { return $this->persist($request, $tableName); }
    private function persist(Request $request, ?string $currentTableName = null): RedirectResponse
    {
        $newName = strtolower(trim($request->input('name')));
        if ($currentTableName) {
            Schema::table($currentTableName, function ($table) use ($currentTableName, $newName) {
                $table->renameColumn("id_{$currentTableName}", "id_{$newName}");
                $table->renameColumn($currentTableName, $newName);
            });
            Schema::rename($currentTableName, $newName);
            $message = "Tabla renombrada a '{$newName}' correctamente.";
        } else {
            Schema::create($newName, function ($table) use ($newName) {
                $table->id("id_{$newName}");
                $table->string($newName, 50);
                $table->foreignId('creater_id');
                $table->foreignId('updater_id')->nullable();
                $table->timestamps();
            }); $message = "Tabla '{$newName}' creada con éxito.";
        }
        return $this->notifyAndRedirect($message);
    }
    public function destroy(string $tableName): RedirectResponse
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists($tableName);
        Schema::enableForeignKeyConstraints();
        return $this->notifyAndRedirect("Tabla '{$tableName}' eliminada correctamente.");
    }
}