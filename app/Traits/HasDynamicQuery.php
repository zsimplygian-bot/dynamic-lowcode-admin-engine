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
            $expr      = $specialMap[$col] ?? "{$table}.{$col}";
            $op        = $isNumeric ? '=' : 'LIKE';
            $bound     = $isNumeric ? $val : "%{$val}%";
            $method    = $isSpecial ? ($isOr ? 'orWhereRaw' : 'whereRaw') : ($isOr ? 'orWhere' : 'where');
            $isSpecial 
                ? $q->{$method}("{$expr} {$op} ?", [$bound])
                : $q->{$method}($expr, $op, $bound);
        };
        // 3. Buscador Global
        if ($search = $request->input('search') ?? $request->input('q')) {
            $query->where(function (Builder $subQ) use ($columns, $search, $applyCondition) {
                foreach ($columns as $col) {
                    if (!empty($col['searchable'])) {
                        $applyCondition($subQ, $col['accessor'], $search, false, true);
                    }
                }
            });
        }
        // 4. Filtros Específicos por Columna
        $typeMap  = array_column($columns, 'type', 'accessor');
        $numTypes = ['number', 'numeric', 'integer', 'int', 'decimal', 'float'];
        $excluded = ['page', 'per_page', 'sort_by', 'sort_order', '_r', 'from', 'to', 'search', 'q'];
        foreach ($request->except($excluded) as $col => $val) {
            if ($val !== null && $val !== '') {
                $isNumeric = in_array($typeMap[$col] ?? 'text', $numTypes);
                $applyCondition($query, $col, $val, $isNumeric);
            }
        }
        // 5. Ordenamiento dinámico (Soporta subconsultas y columnas extras)
        $sortBy    = $request->input('sort_by');
        $sortOrder = strtolower($request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';
        $pk        = in_array("id_{$table}", array_column($columns, 'accessor')) ? "id_{$table}" : "id";
        $rawCol  = $sortBy ? ($specialMap[$sortBy] ?? "{$table}.{$sortBy}") : "{$table}.{$pk}";
        $sortCol = str_contains($rawCol, '(') ? DB::raw($rawCol) : $rawCol;
        return $query->orderBy($sortCol, $sortOrder);
    }
}