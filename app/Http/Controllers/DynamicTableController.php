<?php
namespace App\Http\Controllers;
use App\Traits\{HasDynamicQuery, HasTableFieldMetadata};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\{Inertia, Response};
class DynamicTableController extends Controller
{
    use HasTableFieldMetadata, HasDynamicQuery;
    public function show(string $table): Response
    {
        if (!Schema::hasTable($table)) abort(404, "La tabla '{$table}' no existe.");
        return Inertia::render('dynamic-table', ['tableName' => $table]);
    }
    public function columns(string $table)
    {
        return $this->getTableFieldMetadata($table);
    }
    public function data(Request $request, string $table)
    {
        $perPage = (int) $request->input('per_page', 10);
        $data = $this->buildTableQuery($request, $table, $this->getTableFieldMetadata($table))->paginate($perPage);
        return [
            'data'     => $data->items(),
            'total'    => $data->total(),
            'page'     => $data->currentPage(),
            'per_page' => $data->perPage(),
        ];
    }
    public function export(Request $request, string $table)
    {
        return [
            'data' => $this->buildTableQuery($request, $table, $this->getTableFieldMetadata($table))->get(),
        ];
    }
}   