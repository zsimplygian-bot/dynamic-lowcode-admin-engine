<?php
namespace App\Http\Controllers;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
class LookupController extends Controller
{
    public function index(Request $request, string $campo): JsonResponse
    {
        $tabla = Str::after($campo, 'id_');
        $hasEmoji = in_array("emoji_{$tabla}", DB::getSchemaBuilder()->getColumnListing($tabla));
        $labelSql = $hasEmoji
            ? "TRIM(CONCAT_WS(' ', COALESCE(emoji_{$tabla}, ''), {$tabla})) as label"
            : "{$tabla} as label";
        $query = DB::table($tabla)->select(["{$campo} as id", DB::raw($labelSql)]);
        if ($singleId = $request->query('id')) {
            $query->where($campo, $singleId);
        } else {
            $query->orderBy($tabla, 'asc');
        }
        $data = $query->get()->map(fn ($item) => [
            'id'    => $item->id,
            'label' => $item->label,
        ]);
        return response()->json($data);
    }
}