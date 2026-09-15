<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Schema};
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class LookupController extends Controller
{
    public function index(Request $request, string $campo): JsonResponse
    {
        $singleId = $request->query('id');

        if ($campo === 'role_id') {
            try {
                $q = Role::query()->select(['id', 'name as label']);
                $singleId ? $q->where('id', $singleId) : $q->orderBy('name', 'asc');
                return response()->json($q->get());
            } catch (\Throwable $e) {
                return response()->json([]);
            }
        }

        if ($campo === 'id') {
            try {
                $q = User::query()->select(['id', 'name as label']);
                $singleId ? $q->where('id', $singleId) : $q->orderBy('name', 'asc');
                return response()->json($q->get());
            } catch (\Throwable $e) {
                return response()->json([]);
            }
        }

        $tabla = Str::startsWith($campo, 'id_') ? Str::after($campo, 'id_') : $campo;

        if (!Schema::hasTable($tabla)) return response()->json([]);

        $hasEmoji = in_array("emoji_{$tabla}", Schema::getColumnListing($tabla));
        $labelSql = $hasEmoji
            ? "TRIM(CONCAT_WS(' ', COALESCE(emoji_{$tabla}, ''), {$tabla})) as label"
            : "{$tabla} as label";

        $q = DB::table($tabla)->select(["{$campo} as id", DB::raw($labelSql)]);
        $singleId ? $q->where($campo, $singleId) : $q->orderBy($tabla, 'asc');

        return response()->json($q->get()->map(fn ($i) => ['id' => $i->id, 'label' => $i->label]));
    }
}