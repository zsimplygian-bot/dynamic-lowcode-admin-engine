<?php
namespace App\Http\Controllers;
use App\Traits\HasDynamicQuery;
use App\Traits\HasTableFieldMetadata;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class DynamicActivityController extends Controller
{
    use HasTableFieldMetadata, HasDynamicQuery;
    public function actividades(Request $request, string $table): JsonResponse
    {
        if (!$this->hasTableInSchema($table)) {
            return response()->json(['message' => "La tabla '{$table}' no existe."], 404);
        }
        $columns = $this->getTableFieldMetadata($table);
        $records = $this->buildTableQuery($request, $table, $columns)->get();
        return response()->json([
            'columns' => $columns,
            'data'    => $records,
        ]);
    }
}