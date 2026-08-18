<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class LookupController extends Controller
{
    public function index(Request $request, string $campo, DynamicFormSchemaController $schemaController): JsonResponse
    {
        // 1. Deducir el nombre de la tabla
        $tabla = Str::startsWith($campo, 'id_') ? Str::after($campo, 'id_') : $campo;

        if (!Schema::hasTable($tabla)) {
            return response()->json([
                'options'    => [],
                'viewConfig' => null,
            ]);
        }

        // 2. Determinar columna clave primaria
        $pkColumn = "id_{$tabla}";
        if (!Schema::hasColumn($tabla, $pkColumn)) {
            $pkColumn = Schema::hasColumn($tabla, 'id') ? 'id' : Schema::getColumnListing($tabla)[0];
        }

        // 3. Detección inteligente de la columna para la etiqueta (label)
        $candidates = [$tabla, 'nombre', 'name', 'descripcion', 'description', 'razon_social', 'titulo', 'title', 'codigo', 'code'];
        $labelColumn = null;

        foreach ($candidates as $candidate) {
            if (Schema::hasColumn($tabla, $candidate)) {
                $labelColumn = $candidate;
                break;
            }
        }

        if (!$labelColumn) {
            $columns = Schema::getColumnListing($tabla);
            foreach ($columns as $col) {
                if ($col !== $pkColumn && !Str::contains($col, ['created_at', 'updated_at', 'deleted_at', 'password'])) {
                    $labelColumn = $col;
                    break;
                }
            }
        }

        $labelColumn = $labelColumn ?? $pkColumn;

        // 4. Construir la consulta base
        $query = DB::table($tabla)
            ->select(["{$pkColumn} as id", "{$labelColumn} as label"]);

        // OPTIMIZACIÓN: Si viene un ID específico, se filtra solo por ese registro
        $singleId = $request->query('id');
        if ($singleId !== null && $singleId !== '') {
            $query->where($pkColumn, $singleId);
        } else {
            $query->orderBy($labelColumn, 'asc');
        }

        $options = $query->get()->map(fn ($item) => [
            'id'    => (string) $item->id,
            'label' => (string) ($item->label ?? ''),
        ]);

        // 5. Obtener metadatos de campos usando DynamicFormSchemaController
        $fields = $schemaController->getTableSchema($tabla);

        // 6. Construir metadatos de la vista
        $viewConfig = [
            'view'   => $tabla,
            'title'  => Str::title(str_replace('_', ' ', $tabla)),
            'fields' => $fields,
        ];

        return response()->json([
            'options'    => $options,
            'viewConfig' => $viewConfig,
        ]);
    }
}