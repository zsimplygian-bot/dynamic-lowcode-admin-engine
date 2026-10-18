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
                ->select(
                    'c.id',
                    'c.fecha',
                    'mo.motivo',
                    'm.mascota',
                    'cl.cliente',
                    'ec.estado_cita as estado' // O ec.nombre / ec.estado
                )
                ->where([
                    ['ec.estado_cita', 'pendiente'], // Cambia 'ec.estado_cita' si tu columna es 'ec.nombre' o 'ec.estado'
                    ['c.fecha', '>=', now()->startOfDay()]
                ])
                ->orderBy('c.fecha')
                ->get()
                ->each(function ($c) {
                    $fecha = Carbon::parse($c->fecha);
                    $c->tiempo_restante = $fecha->diffForHumans(['parts' => 2]);
                    $c->es_hoy = $fecha->isToday();
                })
        );
    }
    public function atender(string $id) { return $this->updateEstado($id, 'atendido', 'Appointment marked as attended.'); }
    public function cancelar(string $id) { return $this->updateEstado($id, 'cancelado', 'Appointment cancelled successfully.'); }
    private function updateEstado(string $id, string $estadoNombre, string $msg)
    {
        $estadoCitaId = DynamicModel::fromTable('estado_cita')
            ->where('estado_cita', $estadoNombre) // O 'nombre' / 'estado'
            ->value('id');
        if ($estadoCitaId) {
            DynamicModel::fromTable('cita')
                ->find($id)
                ?->update(['estado_cita_id' => $estadoCitaId]);
        }
        return $this->notify($msg);
    }
}