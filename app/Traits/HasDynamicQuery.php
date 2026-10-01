<?php

namespace App\Traits;

use Illuminate\Database\Query\Builder;
use Illuminate\Database\Query\Expression;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

trait HasDynamicQuery
{
    use HasDynamicRelations, HasExtraColumns;

    protected function buildTableQuery(Request $request, string $table, array $columns): Builder
    {
        $query = DB::table($table)->select("{$table}.*");

        // 1. Mapeo unificado de expresiones SQL especiales (Joins + Calculadas)
        $specialMap = array_merge(
            $this->applyDynamicJoins($query, $table, $columns),
            $this->applyExtraColumns($query, $table)
        );

        // 2. Filtro de Fechas
        $query->when($request->input('from'), fn($q, $f) => $q->where("{$table}.created_at", '>=', "{$f} 00:00:00"))
              ->when($request->input('to'),   fn($q, $t) => $q->where("{$table}.created_at", '<=', "{$t} 23:59:59"));

        // Helper reutilizable para aplicar cláusulas WHERE (DRY)
        $applyCondition = function ($q, string $col, mixed $val, bool $isNumeric = false, bool $isOr = false) use ($table, $specialMap) {
            $isSpecial = isset($specialMap[$col]);
            $rawExpr   = $specialMap[$col] ?? "{$table}.{$col}";
            $expr      = $rawExpr instanceof Expression ? $rawExpr->getValue($q->getGrammar()) : (string) $rawExpr;
            $op        = $isNumeric ? '=' : 'LIKE';
            $bound     = $isNumeric ? $val : "%{$val}%";

            if ($isSpecial) {
                $method = $isOr ? 'orWhereRaw' : 'whereRaw';
                $q->{$method}("{$expr} {$op} ?", [$bound]);
            } else {
                $method = $isOr ? 'orWhere' : 'where';
                $q->{$method}($expr, $op, $bound);
            }
        };

        // 3. Buscador Global (Soporta locales, foráneos y extra/calculados)
        if ($search = $request->input('search') ?? $request->input('q')) {
            $query->where(function (Builder $subQ) use ($columns, $search, $applyCondition, $specialMap) {
                $first = true;
                foreach ($columns as $col) {
                    $accessor = is_array($col) ? ($col['accessor'] ?? null) : $col;
                    
                    // Si el campo pertenece a un Join o es un Extra Column (Special Map), forzar searchable
                    $isSpecial = isset($specialMap[$accessor]);
                    $isSearchable = is_array($col) ? (!empty($col['searchable']) || $isSpecial) : true;

                    if ($accessor && $isSearchable) {
                        $applyCondition($subQ, $accessor, $search, false, !$first);
                        $first = false;
                    }
                }
            });
        }

        // 4. Filtros Específicos por Columna
        $typeMap  = is_array(reset($columns)) ? array_column($columns, 'type', 'accessor') : [];
        $numTypes = ['number', 'numeric', 'integer', 'int', 'decimal', 'float'];
        $excluded = ['page', 'per_page', 'sort_by', 'sort_order', '_r', 'from', 'to', 'search', 'q'];

        foreach ($request->except($excluded) as $col => $val) {
            if ($val !== null && $val !== '') {
                $isNumeric = in_array($typeMap[$col] ?? 'text', $numTypes, true);
                $applyCondition($query, $col, $val, $isNumeric, false);
            }
        }

        // 5. Ordenamiento dinámico
        $sortBy    = $request->filled('sort_by') ? $request->input('sort_by') : null;
        $sortOrder = strtolower($request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';
        $pk        = "id_{$table}";
        $rawCol    = $sortBy ? ($specialMap[$sortBy] ?? "{$table}.{$sortBy}") : "{$table}.{$pk}";
        $sortCol   = $rawCol instanceof Expression ? $rawCol : (str_contains((string) $rawCol, '(') ? DB::raw($rawCol) : $rawCol);

        return $query->orderBy($sortCol, $sortOrder);
    }
}