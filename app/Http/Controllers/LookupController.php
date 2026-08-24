<?php

namespace App\Http\Controllers;

use App\Traits\HasSchemaCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LookupController extends Controller
{
    use HasSchemaCache;

    public function index(Request $request, string $campo): JsonResponse
    {
        $tabla = Str::startsWith($campo, 'id_') ? Str::after($campo, 'id_') : $campo;

        if (!$this->hasTableInSchema($tabla)) {
            return response()->json([]);
        }

        $pkColumn = "id_{$tabla}";
        $rawColumns = collect($this->getRawTableColumns($tabla))->pluck('name');

        $labelColumn = $rawColumns->contains($tabla)
            ? $tabla
            : ($rawColumns->reject(fn ($col) => $col === $pkColumn || in_array($col, ['created_at', 'updated_at', 'deleted_at', 'password'], true))->first() ?? $pkColumn);

        $emojiColumn = $rawColumns->first(fn ($col) => Str::startsWith($col, "emoji_{$tabla}"));

        $selectLabel = $emojiColumn
            ? DB::raw("CONCAT(COALESCE({$emojiColumn}, ''), ' ', COALESCE({$labelColumn}, '')) as label")
            : "{$labelColumn} as label";

        $singleId = $request->query('id');

        // Registro único por ID
        if ($singleId !== null && $singleId !== '') {
            $record = DB::table($tabla)
                ->select(["{$pkColumn} as id", $selectLabel])
                ->where($pkColumn, $singleId)
                ->first();

            return response()->json($record ? [[
                'id'    => (string) $record->id,
                'label' => trim((string) $record->label),
            ]] : []);
        }

        // Listado completo
        $options = DB::table($tabla)
            ->select(["{$pkColumn} as id", $selectLabel])
            ->orderBy($labelColumn, 'asc')
            ->get()
            ->map(fn ($item) => [
                'id'    => (string) $item->id,
                'label' => trim((string) $item->label),
            ]);

        return response()->json($options);
    }
}