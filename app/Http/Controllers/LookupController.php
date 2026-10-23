<?php

namespace App\Http\Controllers;

use App\Models\DynamicModel;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LookupController extends Controller
{
    public function index(Request $request, string $field)
    {
        if ($field === 'mascota_id') {
            $query = DynamicModel::fromTable('mascota')
                ->join('cliente', 'mascota.cliente_id', '=', 'cliente.id')
                ->selectRaw("mascota.id, CONCAT(mascota.mascota, ' (', cliente.cliente, ')') as label")
                ->when($request->query('id'), fn($q, $id) => $q->where('mascota.id', $id), fn($q) => $q->orderBy('mascota.mascota'));
        } elseif ($field === 'user_id' || $field === 'users_id') {
            $query = DynamicModel::fromTable('users')
                ->select('id', 'name as label')
                ->when($request->query('id'), fn($q, $id) => $q->where('id', $id), fn($q) => $q->orderBy('name'));
        } else {
            $table = Str::before($field, '_id');
            $query = DynamicModel::fromTable($table)
                ->select('id', "{$table} as label")
                ->when($request->query('id'), fn($q, $id) => $q->where('id', $id), fn($q) => $q->orderBy($table));
        }

        return response()->json($query->get());
    }
}