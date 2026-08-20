<?php

namespace App\Traits;

use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

trait HasDynamicQuery
{
    use HasDynamicRelations;

    protected function buildTableQuery(Request $request, string $table, array $columns): Builder
    {
        $query = DB::table($table);

        $this->applyDynamicJoins($query, $table, $columns);

        // Filtro por rango de fechas en 'created_at' usando $from y $to
        $from = $request->input('from');
        $to   = $request->input('to');

        if ($from && $to) {
            $query->whereBetween("{$table}.created_at", ["{$from} 00:00:00", "{$to} 23:59:59"]);
        } elseif ($from) {
            $query->where("{$table}.created_at", '>=', "{$from} 00:00:00");
        } elseif ($to) {
            $query->where("{$table}.created_at", '<=', "{$to} 23:59:59");
        }

        // Filtros dinámicos por columna directamente desde el $request
        $searchMap = array_column($columns, 'searchColumn', 'accessor');
        $typeMap   = array_column($columns, 'type', 'accessor');
        $excludedKeys = ['page', 'per_page', 'sort_by', 'sort_order', '_r', 'from', 'to'];

        foreach ($request->except($excludedKeys) as $column => $value) {
            if ($value === null || $value === '') continue;

            $targetCol = $searchMap[$column] ?? "{$table}.{$column}";
            $colType   = $typeMap[$column] ?? 'text';

            in_array($colType, ['number', 'numeric', 'integer', 'int', 'decimal', 'float'])
                ? $query->where($targetCol, '=', $value)
                : $query->where($targetCol, 'LIKE', "%{$value}%");
        }

        // Ordenamiento dinámico o por ID primario por defecto
        $sortBy = $request->input('sort_by');

        if ($sortBy) {
            $targetSort = $searchMap[$sortBy] ?? "{$table}.{$sortBy}";
            $sortOrder  = $request->input('sort_order') === 'desc' ? 'desc' : 'asc';
            $query->orderBy($targetSort, $sortOrder);
        } else {
            $query->orderBy("{$table}.id_{$table}", 'desc');
        }

        return $query;
    }
}