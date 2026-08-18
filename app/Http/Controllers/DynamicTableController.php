<?php

namespace App\Http\Controllers;

use App\Traits\HasDynamicRelations;
use App\Traits\HasTableMetadata;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class DynamicTableController extends Controller
{
    use HasTableMetadata, HasDynamicRelations;

    private function buildTableQuery(Request $request, string $table, array &$columns)
    {
        $query = DB::table($table);
        $this->applyDynamicJoins($query, $table, $columns);
        
        if ($request->has('filters') && is_array($request->input('filters'))) {
            foreach ($request->input('filters') as $column => $value) {
                if ($value === null || $value === '') continue;
                $targetCol = $this->resolveSearchColumn($columns, $column, $table);
                if ($targetCol) {
                    $query->where($targetCol, 'LIKE', "%{$value}%");
                }
            }
        }

        $sortBy = $request->input('sort_by');
        $sortOrder = strtolower($request->input('sort_order', 'asc')) === 'desc' ? 'desc' : 'asc';
        if ($sortBy) {
            $targetSort = $this->resolveSearchColumn($columns, $sortBy, $table);
            if ($targetSort) {
                $query->orderBy($targetSort, $sortOrder);
            }
        } else {
            $query->orderBy("{$table}.id_{$table}", 'desc');
        }
        return $query;
    }

    private function resolveSearchColumn(array $columns, string $accessor, string $mainTable): ?string
    {
        foreach ($columns as $col) {
            if ($col['accessor'] === $accessor) {
                return $col['searchColumn'] ?? "{$mainTable}.{$accessor}";
            }
        }
        return null;
    }

    public function show(string $table): Response
    {
        $this->ensureTableExists($table);
        return Inertia::render('dynamic-table', [
            'tableName' => $table,
        ]);
    }

    public function data(Request $request, string $table): JsonResponse
    {
        if (!Schema::hasTable($table)) {
            return response()->json(['message' => "La tabla '{$table}' no existe."], 404);
        }
        $columns = $this->getTableColumns($table);
        $perPage = (int) $request->input('per_page', 15);
        $query = $this->buildTableQuery($request, $table, $columns);
        $data = $query->paginate($perPage);
        return response()->json([
            'columns'  => $columns,
            'data'     => $data->items(),
            'total'    => $data->total(),
            'page'     => $data->currentPage(),
            'per_page' => $data->perPage(),
        ]);
    }
}