<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TableController extends Controller
{
    private function cleanTableName(string $rawName): string
    {
        return str_contains($rawName, '.') ? last(explode('.', $rawName)) : $rawName;
    }

    private function getCleanTables(): array
    {
        return array_map(fn($t) => $this->cleanTableName($t), Schema::getTableListing());
    }

    private function notifyAndRedirect(string $message, string $type = 'success', string $route = 'settings.tables.index'): RedirectResponse
    {
        Inertia::flash('toast', [
            'type' => $type,
            'message' => __($message),
        ]);

        return back();
    }

    public function index(): Response
    {
        $tablesData = DB::table('information_schema.tables')
            ->where('table_schema', DB::getDatabaseName())
            ->where('table_type', 'BASE TABLE')
            ->select('table_name as name', 'table_rows as rows_count')
            ->orderBy('table_name')
            ->get()
            ->map(fn($item) => [
                'id' => $item->name,
                'name' => $item->name,
                'rows_count' => (int) ($item->rows_count ?? 0),
            ]);

        return Inertia::render('settings/tables', ['dbTables' => $tablesData]);
    }

    public function show(string $table): Response
{
    $cleanTable = $this->cleanTableName($table);
    $database = DB::getDatabaseName();

    abort_unless(Schema::hasTable($cleanTable), 404, 'La tabla especificada no existe.');

    // 1. Obtener llaves primarias usando la API de Schema (100% compatible sin fallar por case-sensitivity)
    $primaryKeys = collect(Schema::getIndexes($cleanTable))
        ->filter(fn($index) => $index['primary'])
        ->flatMap(fn($index) => $index['columns'])
        ->toArray();

    // 2. Obtener información de las columnas con alias explícitos en el SELECT
    $columns = DB::table('information_schema.columns')
        ->where('table_schema', $database)
        ->where('table_name', $cleanTable)
        ->select(
            DB::raw('COLUMN_NAME as name'),
            DB::raw('DATA_TYPE as type'),
            DB::raw('IS_NULLABLE as is_nullable'),
            DB::raw('COLUMN_DEFAULT as default_val')
        )
        ->orderBy('ordinal_position')
        ->get()
        ->map(fn($col) => [
            'id' => $col->name,
            'name' => $col->name,
            'type' => $col->type,
            'is_nullable' => $col->is_nullable === 'YES',
            'is_primary' => in_array($col->name, $primaryKeys),
            'default_value' => $col->default_val,
        ]);

    return Inertia::render('settings/tables-fields', [
        'tableName' => $cleanTable,
        'fieldsList' => $columns,
    ]);
}

    public function create(): Response
    {
        return Inertia::render('settings/tables-create');
    }

    public function edit(string $table): Response
    {
        $cleanTable = $this->cleanTableName($table);
        abort_unless(Schema::hasTable($cleanTable), 404, 'La tabla especificada no existe.');

        return Inertia::render('settings/tables-edit', [
            'table' => ['id' => $cleanTable, 'name' => $cleanTable],
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
        $isUpdate = !is_null($currentTable);
        $cleanTable = $isUpdate ? $this->cleanTableName($currentTable) : null;

        if ($isUpdate) {
            abort_unless(Schema::hasTable($cleanTable), 404, 'La tabla especificada no existe.');
        }

        $existingTables = $isUpdate 
            ? array_diff($this->getCleanTables(), [$cleanTable]) 
            : $this->getCleanTables();

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:64',
                'regex:/^[a-zA-Z_][a-zA-Z0-9_]*$/',
                Rule::notIn($existingTables),
            ],
        ], [
            'name.regex' => 'El nombre solo puede contener letras, números y guiones bajos.',
            'name.not_in' => 'Ya existe una tabla con este nombre.',
        ]);

        $newName = strtolower($validated['name']);

        if (!$isUpdate) {
            Schema::create($newName, function ($table) use ($newName) {
                // 1. Primaria tipo INT autoincrementable: id_{title}
                $table->integer("id_{$newName}")->autoIncrement()->primary();

                // 2. Campo de texto corto: {title} VARCHAR(50)
                $table->string($newName, 50);

                // 3. Creación y Auditoría: creater_id (INT 11)
                $table->integer('creater_id');

                // 4. Auditoría de Edición: updater_id (INT 11 NULLABLE)
                $table->integer('updater_id')->nullable();

                // 5. Timestamps: created_at y updated_at tipo DATETIME
                $table->dateTime('created_at');
                $table->dateTime('updated_at')->nullable();
            });

            $message = "Tabla '{$newName}' creada con éxito.";
        } else {
            if ($cleanTable !== $newName) {
                Schema::rename($cleanTable, $newName);
            }
            $message = "Tabla renombrada a '{$newName}' correctamente.";
        }

        return $this->notifyAndRedirect($message);
    }

    public function destroy(string $table): RedirectResponse
    {
        $cleanTable = $this->cleanTableName($table);

        if (Schema::hasTable($cleanTable)) {
            Schema::disableForeignKeyConstraints();
            Schema::dropIfExists($cleanTable);
            Schema::enableForeignKeyConstraints();

            return $this->notifyAndRedirect("Tabla '{$cleanTable}' eliminada correctamente.");
        }

        return back();
    }
}