<?php
namespace App\Http\Controllers;
use App\Models\DynamicModel;
use App\Services\{ColumnMetadata, TableMetadata};
use App\Traits\{HasColumnLabel, HasDynamicRelations};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Cache, Schema};
use Inertia\Inertia;
class DynamicTableController extends Controller
{
    use HasColumnLabel, HasDynamicRelations;
    public function show(string $table) { if (!Schema::hasTable($table)) abort(404, "La tabla '{$table}' no existe."); return Inertia::render('dynamic-table', ['tableName' => $table]); }
    public function columns(string $table)
    {
        return Cache::rememberForever("table_ui_cols_{$table}", fn () => array_merge(
            array_map(function ($c) {
                $isCheckbox = ColumnMetadata::inputType($c['name'], $c['type']) === 'checkbox';
                return ['accessor' => str_ends_with($c['name'], '_id') ? substr($c['name'], 0, -3) : $c['name'],
                        'header'   => $this->inferLabel($c['name'], $c['comment'] ?? null) . ($isCheckbox ? '?' : ''), ];
            }, $this->getColumnsMetadata($table)), [['accessor' => 'created_at', 'header' => 'CREATED AT']]
        ));
    }
    public function data(Request $request, string $table)
    {
        $data = $this->buildTableQuery($request, $table)->paginate((int) $request->input('per_page', 10));
        return ['data' => $data->items(), 'total' => $data->total(), 'page' => $data->currentPage(), 'per_page' => $data->perPage()];
    }
    public function export(Request $request, string $table) { return ['data' => $this->buildTableQuery($request, $table)->get()]; }
    private function getColumnsMetadata(string $table): array { return Cache::rememberForever("table_schema_{$table}", fn () => Schema::getColumns($table)); }
    private function getTableColumns(string $table): array { return array_column($this->getColumnsMetadata($table), 'name'); }
    private function buildTableQuery(Request $request, string $table)
    {
        $cols = $this->getTableColumns($table);
        $localCols = array_filter($cols, fn ($c) => !str_ends_with($c, '_id'));
        $query = DynamicModel::fromTable($table)
            ->select(array_map(fn ($c) => "{$table}.{$c}", $localCols))
            ->join('audit', fn ($j) => $j->on('audit.row_id', '=', "{$table}.id")->where('audit.table', TableMetadata::id($table))->where('audit.action', 's'))
            ->addSelect('audit.at as created_at')
            ->when($request->input('from'), fn ($q, $from) => $q->where('audit.at', '>=', $from))->when($request->input('to'), fn ($q, $to) => $q->where('audit.at', '<=', $to));
        $this->applyDynamicJoins($query, $table, $cols);
        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($table, $cols, $localCols, $search) {
                foreach ($localCols as $col) $q->orWhere("{$table}.{$col}", 'like', "%{$search}%");
                $this->applyDynamicSearch($q, $search, $cols);
            });
        }
        foreach (array_filter($request->except(['page', 'per_page', 'sort_by', 'sort_order', 'search', 'from', 'to']), fn ($v) => $v !== null && $v !== '') as $field => $val) {
            if (in_array($field, $cols, true)) { $query->where("{$table}.{$field}", str_ends_with($field, '_id') ? '=' : 'like', str_ends_with($field, '_id') ? $val : "%{$val}%"); }
        }
        $sortBy = $request->input('sort_by');
        $sortOrder = $request->input('sort_order', 'desc') === 'asc' ? 'asc' : 'desc';
        $orderCol = $sortBy === 'created_at' ? 'audit.at' : ($sortBy ? $this->getSortColumn($table, $sortBy, $cols) : "{$table}.id");
        return $query->orderBy($orderCol, $sortOrder);
    }
}