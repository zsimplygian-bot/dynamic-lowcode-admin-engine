<?php
namespace App\Traits;
use App\Models\DynamicModel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
trait HasDynamicQuery
{
    use HasDynamicRelations;
    protected function buildTableQuery(Request $request, string $table, array $columns): Builder
    {
        $query = DynamicModel::fromTable($table)->select("{$table}.*");
        $this->applyDynamicJoins($query, $table, $columns);
        $where = function ($q, string $col, mixed $val, bool $isNumeric = false, bool $isOr = false) use ($table) {
            $raw = str_ends_with($col, '_id') ? substr($col, 0, -3) . '.' . substr($col, 0, -3) : "{$table}.{$col}";
            $op = $isNumeric ? '=' : 'LIKE';
            $bound = $isNumeric ? $val : "%{$val}%";
            $method = $isOr ? 'orWhere' : 'where';
            $q->{$method}($raw, $op, $bound);
        };
        // 1. Buscador Global
        if ($search = $request->input('search') ?? $request->q) {
            $query->where(function ($subQ) use ($columns, $search, $where) {
                $first = true;
                foreach ($columns as $col) {
                    if (!empty($col['searchable'])) {
                        $where($subQ, $col['accessor'], $search, false, !$first);
                        $first = false;
                    }
                }
            });
        }
        // 2. Filtros por Columna
        $typeMap = array_column($columns, 'type', 'accessor');
        $excluded = ['page', 'per_page', 'sort_by', 'sort_order', '_r', 'search', 'q'];
        foreach ($request->except($excluded) as $col => $val) {
            if ($val !== null && $val !== '') {
                $isNumeric = in_array($typeMap[$col] ?? 'text', ['number', 'numeric', 'integer', 'int', 'decimal', 'float'], true);
                $where($query, $col, $val, $isNumeric);
            }
        }
        // 3. Ordenamiento
        $sortBy = $request->sort_by;
        $sortOrder = strtolower($request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';
        $sortCol = $sortBy ? (str_ends_with($sortBy, '_id') ? substr($sortBy, 0, -3) : "{$table}.{$sortBy}") : "{$table}.id";
        return $query->orderBy(str_contains((string)$sortCol, '(') ? DB::raw($sortCol) : $sortCol, $sortOrder);
    }
}