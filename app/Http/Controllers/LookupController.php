<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Schema};
use Illuminate\Support\Str;

class LookupController extends Controller
{
    public function index(Request $request, string $campo)
    {
        $id = $request->query('id');

        if ($override = $this->resolveOverride($campo, $id)) {
            return response()->json($override);
        }

        $tabla = Str::after($campo, 'id_');
        $label = in_array("emoji_{$tabla}", Schema::getColumnListing($tabla))
            ? "CONCAT_WS(' ', emoji_{$tabla}, {$tabla})"
            : $tabla;

        $q = DB::table($tabla)->select(["{$campo} as id", DB::raw("{$label} as label")]);

        return response()->json(($id ? $q->where($campo, $id) : $q->orderBy($tabla))->get());
    }

    private function resolveOverride(string $campo, ?string $id)
    {
        $extraLookups = [
            'id' => ['users', 'id', 'name'],
            'id_rol' => ['roles', 'id', 'name'],
        ];

        if (!isset($extraLookups[$campo])) return null;

        [$tabla, $pk, $colLabel] = $extraLookups[$campo];
        $q = DB::table($tabla)->select(["{$pk} as id", "{$colLabel} as label"]);

        return ($id ? $q->where($pk, $id) : $q->orderBy($colLabel))->get();
    }
}