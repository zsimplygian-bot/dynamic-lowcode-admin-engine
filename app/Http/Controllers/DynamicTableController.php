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

    public function show(string $table) 
    { 
        return Inertia::render('dynamic-table', ['tableName' => $table]); 
    }

    public function columns(string $table)
    {
        return Cache::rememberForever("table_ui_cols_{$table}", function () use ($table) {
            $cols = array_map(fn ($c) => [
                'accessor' => str_ends_with($c['name'], '_id') ? substr($c['name'], 0, -3) : $c['name'],
                'header'   => $this->inferLabel($c['name'], $c['comment'] ?? null) . (ColumnMetadata::inputType($c['name'], $c['type']) === 'checkbox' ? '?' : ''),
            ], $this->getColumns($table));

            if ($table !== 'audit') $cols[] = ['accessor' => 'created_at', 'header' => 'CREATED AT'];
            return $cols;
        });
    }

    public function data(Request $request, string $table)
    {
        $data = $this->buildTableQuery($request, $table)->paginate((int) $request->input('per_page', 10));
        return ['data' => $data->items(), 'total' => $data->total(), 'page' => $data->currentPage(), 'per_page' => $data->perPage()];
    }

    public function export(Request $request, string $table) 
    { 
        return ['data' => $this->buildTableQuery($request, $table)->get()]; 
    }

    private function getColumns(string $table): array 
    { 
        return Cache::rememberForever("table_schema_{$table}", fn () => Schema::getColumns($table)); 
    }

    private function buildTableQuery(Request $request, string $table)
    {
        $cols = array_column($this->getColumns($table), 'name');
        $localCols = array_filter($cols, fn ($c) => !str_ends_with($c, '_id'));
        $isAudit = $table === 'audit';
        $atCol = $isAudit ? "{$table}.at" : 'audit.at';

        $query = DynamicModel::fromTable($table)->select(array_map(fn ($c) => "{$table}.{$c}", $localCols));

        if (!$isAudit) {
            $tableId = TableMetadata::id($table);

            // Relación con 's' para obtener fecha de creación
            $query->join('audit', fn ($j) => $j->on('audit.row', '=', "{$table}.id")
                  ->where('audit.table', $tableId)->where('audit.action', 's'))->addSelect('audit.at as created_at');

            // Excluir registros cuyo estado de auditoría más reciente sea 'd' (eliminado)
            $query->whereNotExists(fn ($q) => $q->from('audit as a')
                ->where('a.table', $tableId)
                ->whereColumn('a.row', "{$table}.id")
                ->where('a.action', 'd')
                ->whereRaw('a.id = (select max(id) from audit as a2 where a2.table = a.table and a2.row = a.row)')
            );
        }

        $query->when($request->input('from'), fn ($q, $f) => $q->where($atCol, '>=', $f))
              ->when($request->input('to'), fn ($q, $t) => $q->where($atCol, '<=', $t));

        $this->applyDynamicJoins($query, $table, $cols);

        $query->when(trim($request->input('search', '')), fn ($q, $s) => $q->where(function ($sub) use ($table, $localCols, $cols, $s) {
            foreach ($localCols as $col) $sub->orWhere("{$table}.{$col}", 'like', "%{$s}%");
            $this->applyDynamicSearch($sub, $s, $cols);
        }));

        foreach ($request->only($cols) as $field => $val) {
            if ($val !== null && $val !== '') {
                $isId = str_ends_with($field, '_id') || $field === 'id';
                $query->where("{$table}.{$field}", $isId ? '=' : 'like', $isId ? $val : "%{$val}%");
            }
        }

        $sortBy = $request->input('sort_by');
        $orderCol = $sortBy === 'created_at' ? $atCol : ($sortBy ? $this->getSortColumn($table, $sortBy, $cols) : "{$table}.id");

        return $query->orderBy($orderCol, $request->input('sort_order', 'desc') === 'asc' ? 'asc' : 'desc');
    }
}