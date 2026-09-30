<?php
namespace App\Http\Controllers;
use App\Traits\HasNotify;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
class CitaController extends Controller
{
    use HasNotify;
    public function proximas()
    {
        [$t1, $t2, $t3] = ['mascota', 'cliente', 'motivo'];
        $data = DB::table('cita as c')
            ->leftJoin("$t1 as m", "m.id_$t1", "c.id_$t1")
            ->leftJoin("$t2 as cl", "cl.id_$t2", "m.id_$t2")
            ->leftJoin("$t3 as mo", "mo.id_$t3", "c.id_$t3")
            ->select('c.*', 'mo.motivo', 'm.mascota', 'cl.cliente')
            ->where('c.estado', 'PENDIENTE')
            ->where('c.fecha', '>=', now()->startOfDay())
            ->orderBy('c.fecha')
            ->get()
            ->map(function ($cita) {
                $fechaCita = Carbon::parse($cita->fecha);
                $cita->tiempo_restante = $fechaCita->diffForHumans(['parts' => 2]);
                $cita->es_hoy = $fechaCita->isToday();
                return $cita;
            });

        return response()->json($data);
    }
    public function atender(string $id) { return $this->updateEstado($id, 'ATENDIDO', 'Cita atendida correctamente.'); }
    public function cancelar(string $id) { return $this->updateEstado($id, 'CANCELADO', 'Cita cancelada correctamente.'); }
    private function updateEstado(string $id, string $estado, string $msg, string $type = 'success')
    {
        DB::table('cita')->where('id_cita', $id)->update(['estado' => $estado]);
        return $this->notify($msg, $type);
    }
}