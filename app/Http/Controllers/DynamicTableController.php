<?php
namespace App\Http\Controllers;
use App\Models\DynamicModel;
use App\Traits\HasDynamicRelations;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Cache, Schema};
use Illuminate\Support\Str;
use Inertia\Inertia;
class DynamicTableController extends Controller
{
    use HasDynamicRelations;
    public function show(string $table)
    {
        if (!Schema::hasTable($table)) abort(404, "La tabla '{$table}' no existe.");
        return Inertia::render('dynamic-table', ['tableName' => $table]);
    }

    public function columns(string $table)
    {
        return Cache::rememberForever("table_meta_{$table}", fn() => array_map(function ($name) {
            $key = str_ends_with($name, '_id') ? substr($name, 0, -3) : $name;
            return ['accessor' => $key, 'header' => Str::upper(str_replace('_', ' ', $key))];
        }, $this->getTableColumns($table)));
    }
    public function data(Request $request, string $table)
    {
        $perPage = (int) $request->input('per_page', 10);
        $data = $this->buildTableQuery($request, $table)->paginate($perPage);
        return [
            'data'     => $data->items(),
            'total'    => $data->total(),
            'page'     => $data->currentPage(),
            'per_page' => $data->perPage(),
        ];
    }
    public function export(Request $request, string $table) { return ['data' => $this->buildTableQuery($request, $table)->get()]; }
    private function getTableColumns(string $table): array { return Cache::rememberForever("table_cols_{$table}", fn() => Schema::getColumnListing($table)); }
    private function buildTableQuery(Request $request, string $table)
    {
        $cols = $this->getTableColumns($table);
        $localCols = array_filter($cols, fn($c) => !str_ends_with($c, '_id'));
        $query = DynamicModel::fromTable($table)->select(array_map(fn($c) => "{$table}.{$c}", $localCols));
        $this->applyDynamicJoins($query, $table, $cols);
        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($table, $cols, $localCols, $search) {
                foreach ($localCols as $col) $q->orWhere("{$table}.{$col}", 'like', "%{$search}%");
                $this->applyDynamicSearch($q, $search, $cols);
            });
        }
        $reserved = ['page', 'per_page', 'sort_by', 'sort_order', 'search'];
        $filters = array_filter($request->except($reserved), fn($val) => $val !== null && $val !== '');
        foreach ($filters as $field => $value) {
            if (!in_array($field, $cols, true)) continue;
            if (str_ends_with($field, '_id')) { $query->where("{$table}.{$field}", $value);
            } else {  $query->where("{$table}.{$field}", 'like', "%{$value}%");
            }
        }
        $sortBy = $request->input('sort_by');
        $sortOrder = $request->input('sort_order', 'desc') === 'asc' ? 'asc' : 'desc';
        return $query->orderBy($sortBy ? $this->getSortColumn($table, $sortBy, $cols) : "{$table}.id", $sortOrder);
    }
}