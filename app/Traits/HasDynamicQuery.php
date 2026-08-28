<?php

namespace App\Traits;

use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

trait HasDynamicQuery
{
    use HasDynamicRelations, HasExtraColumns;

    protected function buildTableQuery(Request $request, string $table, array $columns): Builder
    {
        $query = DB::table($table);

        // 1. Aplica Joins de foráneas y columnas extras calculadas
        $relationSearchMap = $this->applyDynamicJoins($query, $table, $columns);
        $extraSearchMap    = $this->applyExtraColumns($query, $table);

        // Combinamos los mapas de expresiones SQL especiales
        $specialColumnsMap = array_merge($relationSearchMap, $extraSearchMap);

        // 2. Filtro por rango de fechas (created_at)
        $from = $request->input('from');
        $to   = $request->input('to');

        if ($from && $to) {
            $query->whereBetween("{$table}.created_at", ["{$from} 00:00:00", "{$to} 23:59:59"]);
        } elseif ($from) {
            $query->where("{$table}.created_at", '>=', "{$from} 00:00:00");
        } elseif ($to) {
            $query->where("{$table}.created_at", '<=', "{$to} 23:59:59");
        }

        // 3. Mapeo de tipos
        $typeMap = array_column($columns, 'type', 'accessor');

        // 4. Buscador Global (?search=... o ?q=...)
        $globalSearch = $request->input('search') ?? $request->input('q');
        if (!empty($globalSearch)) {
            $query->where(function (Builder $q) use ($columns, $table, $specialColumnsMap, $globalSearch) {
                foreach ($columns as $col) {
                    if (empty($col['searchable'])) continue;

                    $accessor = $col['accessor'];

                    if (isset($specialColumnsMap[$accessor])) {
                        $rawExpr = $specialColumnsMap[$accessor];
                        $q->orWhereRaw("{$rawExpr} LIKE ?", ["%{$globalSearch}%"]);
                    } else {
                        $q->orWhere("{$table}.{$accessor}", 'LIKE', "%{$globalSearch}%");
                    }
                }
            });
        }

        // 5. Filtros específicos por columna
        $excludedKeys = ['page', 'per_page', 'sort_by', 'sort_order', '_r', 'from', 'to', 'search', 'q'];

        foreach ($request->except($excludedKeys) as $column => $value) {
            if ($value === null || $value === '') continue;

            $colType = $typeMap[$column] ?? 'text';
            $isNumeric = in_array($colType, ['number', 'numeric', 'integer', 'int', 'decimal', 'float']);

            if (isset($specialColumnsMap[$column])) {
                $rawExpr = $specialColumnsMap[$column];
                $isNumeric
                    ? $query->whereRaw("{$rawExpr} = ?", [$value])
                    : $query->whereRaw("{$rawExpr} LIKE ?", ["%{$value}%"]);
            } else {
                $isNumeric
                    ? $query->where("{$table}.{$column}", '=', $value)
                    : $query->where("{$table}.{$column}", 'LIKE', "%{$value}%");
            }
        }

        // 6. Ordenamiento dinámico
        $sortBy    = $request->input('sort_by');
        $sortOrder = strtolower($request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';

        if ($sortBy) {
            if (isset($extraSearchMap[$sortBy])) {
                // Para calculadas ordenamos directamente por el alias o por la expresión SQL
                $query->orderBy($sortBy, $sortOrder);
            } elseif (isset($relationSearchMap[$sortBy])) {
                $query->orderBy($relationSearchMap[$sortBy], $sortOrder);
            } else {
                $query->orderBy("{$table}.{$sortBy}", $sortOrder);
            }
        } else {
            $pkName = in_array("id_{$table}", array_column($columns, 'accessor')) ? "id_{$table}" : "id";
            $query->orderBy("{$table}.{$pkName}", 'desc');
        }

        return $query;
    }
}