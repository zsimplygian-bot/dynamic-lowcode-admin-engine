<?php
namespace App\Http\Controllers;
use App\Models\DynamicModel;
use App\Traits\HasNotify;
class CitaController extends Controller
{
    use HasNotify;
    public function proximas()
    {
        return response()->json(
            DynamicModel::fromTable('cita as c')
                ->join('mascota as m', 'm.id', 'c.mascota_id')->join('cliente as cl', 'cl.id', 'm.cliente_id')->join('motivo as mo', 'mo.id', 'c.motivo_id')
                ->select('c.id', 'c.fecha', 'mo.motivo', 'm.mascota', 'cl.cliente')
                ->where([['c.estado', 'pendiente'], ['c.fecha', '>=', now()->startOfDay()]])
                ->orderBy('c.fecha')
                ->get()
                ->each(function ($c) {
                    $c->tiempo_restante = $c->fecha->diffForHumans(['parts' => 2]);
                    $c->es_hoy = $c->fecha->isToday();
                }));
    }
    public function atender(string $id) { return $this->updateEstado($id, 'atendido', 'Appointment marked as attended.'); }
    public function cancelar(string $id) { return $this->updateEstado($id, 'cancelado', 'Appointment cancelled successfully.'); }
    private function updateEstado(string $id, string $estado, string $msg) { DynamicModel::fromTable('cita')->find($id)?->update(['estado' => $estado]); return $this->notify($msg); }
}