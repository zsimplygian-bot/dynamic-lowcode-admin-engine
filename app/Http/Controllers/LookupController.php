<?php
namespace App\Http\Controllers;
use App\Models\DynamicModel;
use Illuminate\Http\Request;
class LookupController extends Controller
{
    public function index(Request $request, string $field) // Lógica común / orquestación
    {
        $id = $request->id;
        $table = substr($field, 0, -3);
        $query = match ($table) {
            'mascota' => $this->mascota(),
            'users', 'roles' => $this->generic($table, 'name'),
            'motivo', 'sexo', 'especie', 'categoria_producto', 'categoria_procedimiento' => $this->generic($table, $table, emoji: true), // Tablas con emoji
            default => $this->generic($table, $table),
        };
        return response()->json($id ? $query->find($id) : $query->get());
    }
    private function mascota() // Lógica específica / propia
    {
        return DynamicModel::fromTable('mascota')->join('cliente', 'mascota.cliente_id', '=', 'cliente.id')
            ->selectRaw("mascota.id, CONCAT(mascota.mascota, ' - ', cliente.cliente) as label")->orderBy('mascota.mascota');
    }
    private function generic(string $table, string $column, bool $emoji = false) // Lógica genérica
    {
        $label = $emoji ? "CONCAT_WS(' ', emoji_{$table}, {$column})" : $column;
        return DynamicModel::fromTable($table)->selectRaw("id, {$label} as label")->orderBy($column);
    }
}