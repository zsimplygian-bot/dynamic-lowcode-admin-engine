<?php
namespace App\Http\Controllers;
use App\Models\DynamicModel;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
class LookupController extends Controller
{
    public function index(Request $request, string $field)
    {
        $table = Str::before($field, '_id');
        $query = $field === 'mascota_id'
            ? DynamicModel::fromTable('mascota')
                ->join('cliente', 'mascota.cliente_id', '=', 'cliente.id')
                ->selectRaw("mascota.id, CONCAT(mascota.mascota, ' (', cliente.cliente, ')') as label")
                ->when($request->query('id'), fn($q, $id) => $q->where('mascota.id', $id), fn($q) => $q->orderBy('mascota.mascota'))
            : DynamicModel::fromTable($table)
                ->select('id', "{$table} as label")
                ->when($request->query('id'), fn($q, $id) => $q->where('id', $id), fn($q) => $q->orderBy($table));
        return response()->json($query->get());
    }
}