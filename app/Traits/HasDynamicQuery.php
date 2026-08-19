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

        $dateFrom = $request->input('date_from');
        $dateTo   = $request->input('date_to');

        if ($dateFrom && $dateTo) {
            $query->whereBetween("{$table}.created_at", ["{$dateFrom} 00:00:00", "{$dateTo} 23:59:59"]);
        } elseif ($dateFrom) {
            $query->where("{$table}.created_at", '>=', "{$dateFrom} 00:00:00");
        } elseif ($dateTo) {
            $query->where("{$table}.created_at", '<=', "{$dateTo} 23:59:59");
        }

        $filters = $request->input('filters');
        if (is_array($filters) && !empty($filters)) {
            $searchMap = array_column($columns, 'searchColumn', 'accessor');
            foreach ($filters as $column => $value) {
                if ($value === null || $value === '' || $column === 'date_from' || $column === 'date_to') continue;
                $targetCol = $searchMap[$column] ?? "{$table}.{$column}";
                $query->where($targetCol, 'LIKE', "%{$value}%");
            }
        }

        $sortBy = $request->input('sort_by');
        if ($sortBy) {
            $searchMap = $searchMap ?? array_column($columns, 'searchColumn', 'accessor');
            $targetSort = $searchMap[$sortBy] ?? "{$table}.{$sortBy}";
            $sortOrder  = strtolower($request->input('sort_order', 'asc')) === 'desc' ? 'desc' : 'asc';
            $query->orderBy($targetSort, $sortOrder);
        } else {
            $query->orderBy("{$table}.id_{$table}", 'desc');
        }

        return $query;
    }
}