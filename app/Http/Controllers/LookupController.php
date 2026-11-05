<?php
namespace App\Http\Controllers;
use App\Models\DynamicModel;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
class LookupController extends Controller
{
    public function index(Request $request, string $field)
    {
        $id = $request->query('id');
        if ($field === 'mascota') {
            $query = DynamicModel::fromTable('mascota')
                ->join('cliente', 'mascota.cliente_id', '=', 'cliente.id')
                ->selectRaw("mascota.id, CONCAT(mascota.mascota, ' (', cliente.cliente, ')') as label")
                ->when($id, fn($q) => $q->where('mascota.id', $id), fn($q) => $q->orderBy('mascota.mascota'));
        } else {
            $table = Str::before($field, '_id');
            $tableName = match ($table) { 'user', 'users' => 'users', 'role', 'roles' => 'roles', default => $table };
            $column = in_array($tableName, ['users', 'roles']) ? 'name' : $table;
            $query = DynamicModel::fromTable($tableName)
                ->select('id', "{$column} as label")
                ->when($id, fn($q) => $q->where('id', $id), fn($q) => $q->orderBy($column));
        }
        return response()->json($id ? $query->first() : $query->get());
    }
}