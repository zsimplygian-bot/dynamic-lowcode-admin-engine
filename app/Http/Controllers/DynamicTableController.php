<?php
namespace App\Http\Controllers;
use App\Traits\HasDynamicQuery;
use App\Traits\HasTableMetadata;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
class DynamicTableController extends Controller
{
    use HasTableMetadata, HasDynamicQuery;
    public function show(string $table): Response { return Inertia::render('dynamic-table', ['tableName' => $table]); }
    public function data(Request $request, string $table): JsonResponse
    {
        if (!$this->hasTableInSchema($table)) {
            return response()->json(['message' => "La tabla '{$table}' no existe."], 404);
        }
        $columns = $this->getTableColumns($table);
        $perPage = (int) $request->input('per_page', 10);
        $data    = $this->buildTableQuery($request, $table, $columns)->paginate($perPage);
        return response()->json([
            'columns'  => $columns,
            'data'     => $data->items(),
            'total'    => $data->total(),
            'page'     => $data->currentPage(),
            'per_page' => $data->perPage(),
        ]);
    }
}