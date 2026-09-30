<?php
namespace App\Http\Controllers;

use App\Traits\HasDynamicQuery;
use App\Traits\HasTableFieldMetadata;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DynamicTableController extends Controller
{
    use HasTableFieldMetadata, HasDynamicQuery;

    public function show(string $table): Response
    {
        if (!$this->hasTableInSchema($table)) abort(404, "La tabla '{$table}' no existe.");
        return Inertia::render('dynamic-table', ['tableName' => $table]);
    }

    public function columns(string $table): JsonResponse
    {
        return response()->json($this->getTableFieldMetadata($table));
    }

    public function data(Request $request, string $table): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 10);
        $data = $this->buildTableQuery($request, $table, $this->getTableFieldMetadata($table))->paginate($perPage);

        return response()->json([
            'data' => $data->items(),
            'total' => $data->total(),
            'page' => $data->currentPage(),
            'per_page' => $data->perPage(),
        ]);
    }

    public function export(Request $request, string $table): JsonResponse
    {
        return response()->json([
            'data' => $this->buildTableQuery($request, $table, $this->getTableFieldMetadata($table))->get(),
        ]);
    }
}