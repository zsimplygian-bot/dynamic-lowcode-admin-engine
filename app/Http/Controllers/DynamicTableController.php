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

    public function show(string $table): Response
    {
        if (!$this->hasTableInSchema($table)) abort(404, "La tabla '{$table}' no existe.");
        return Inertia::render('dynamic-table', ['tableName' => $table]);
    }

    public function columns(string $table): JsonResponse
    {
        return response()->json($this->getTableMetadata($table));
    }

    public function data(Request $request, string $table): JsonResponse
    {
        $columns = $this->getTableMetadata($table);
        $perPage = (int) $request->input('per_page', 10);
        $data = $this->buildTableQuery($request, $table, $columns)->paginate($perPage);

        return response()->json([
            'data' => $data->items(),
            'total' => $data->total(),
            'page' => $data->currentPage(),
            'per_page' => $data->perPage(),
        ]);
    }

    public function export(Request $request, string $table): JsonResponse
    {
        $columns = $this->getTableMetadata($table);
        return response()->json([
            'data' => $this->buildTableQuery($request, $table, $columns)->get(),
        ]);
    }
}