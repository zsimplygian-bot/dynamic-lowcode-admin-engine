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
        return Cache::rememberForever("table_meta_{$table}", fn() => array_merge(
            array_map(fn($c) => [
                'accessor' => str_ends_with($c, '_id') ? substr($c, 0, -3) : $c,
                'header' => Str::upper(str_replace('_', ' ', str_ends_with($c, '_id') ? substr($c, 0, -3) : $c))
            ], $this->getTableColumns($table)),
            [['accessor' => 'created_at', 'header' => 'CREATED AT']]
        ));
    }
    public function data(Request $request, string $table)
    {
        $data = $this->buildTableQuery($request, $table)->paginate((int) $request->input('per_page', 10));
        return [
            'data' => $data->items(),
            'total' => $data->total(),
            'page' => $data->currentPage(),
            'per_page' => $data->perPage(),
        ];
    }   
    public function export(Request $request, string $table) { return ['data' => $this->buildTableQuery($request, $table)->get()]; }
    private function getTableColumns(string $table): array { return Cache::rememberForever("table_cols_{$table}", fn() => Schema::getColumnListing($table)); }
    private function buildTableQuery(Request $request, string $table)
    {
        $cols = $this->getTableColumns($table);
        $localCols = array_filter($cols, fn($c) => !str_ends_with($c, '_id'));
        $query = DynamicModel::fromTable($table)
            ->select(array_map(fn($c) => "{$table}.{$c}", $localCols))
            ->leftJoin('audit', fn($j) => $j->on('audit.row_id', '=', "{$table}.id")->where('audit.table', $table)->where('audit.action', 's'))
            ->addSelect('audit.at as created_at')
            ->when($request->input('from'), fn($q, $from) => $q->where('audit.at', '>=', $from))->when($request->input('to'), fn($q, $to) => $q->where('audit.at', '<=', $to));
        $this->applyDynamicJoins($query, $table, $cols);
        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($table, $cols, $localCols, $search) {
                foreach ($localCols as $col) $q->orWhere("{$table}.{$col}", 'like', "%{$search}%");
                $this->applyDynamicSearch($q, $search, $cols);
            });
        }
        foreach (array_filter($request->except(['page', 'per_page', 'sort_by', 'sort_order', 'search', 'from', 'to']), fn($v) => $v !== null && $v !== '') as $field => $val) {
            if (in_array($field, $cols, true)) { $query->where("{$table}.{$field}", str_ends_with($field, '_id') ? '=' : 'like', str_ends_with($field, '_id') ? $val : "%{$val}%"); }
        }
        $sortBy = $request->input('sort_by');
        $sortOrder = $request->input('sort_order', 'desc') === 'asc' ? 'asc' : 'desc';
        $orderCol = $sortBy === 'created_at' ? 'audit.at' : ($sortBy ? $this->getSortColumn($table, $sortBy, $cols) : "{$table}.id");
        return $query->orderBy($orderCol, $sortOrder);
    }
}