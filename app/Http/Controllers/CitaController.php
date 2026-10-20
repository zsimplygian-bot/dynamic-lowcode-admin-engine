<?php
namespace App\Http\Controllers;
use App\Models\DynamicModel;
use App\Traits\HasNotify;
use Carbon\Carbon;
class CitaController extends Controller
{
    use HasNotify;
    public function proximas()
    {
        return response()->json(
            DynamicModel::fromTable('cita as c')
                ->join('mascota as m', 'm.id', 'c.mascota_id')
                ->join('cliente as cl', 'cl.id', 'm.cliente_id')
                ->join('motivo as mo', 'mo.id', 'c.motivo_id')
                ->join('estado_cita as ec', 'ec.id', 'c.estado_cita_id')
                ->where('ec.estado_cita', 'pendiente')->where('c.fecha', '>=', now()->startOfDay())
                ->orderBy('c.fecha')
                ->get(['c.id', 'c.fecha', 'mo.motivo', 'm.mascota', 'cl.cliente', 'ec.estado_cita as estado'])
                ->each(fn($c) => [$c->tiempo_restante = Carbon::parse($c->fecha)->diffForHumans(['parts' => 2]), $c->es_hoy = Carbon::parse($c->fecha)->isToday() ]) );
    }
    public function cambiarEstado(string $id, int $estadoId)
    {
        DynamicModel::fromTable('cita')->where('id', $id)->update(['estado_cita_id' => $estadoId]); return $this->notify('Estado actualizado correctamente.');
    }
}