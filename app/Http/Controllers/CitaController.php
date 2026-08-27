<?php
namespace App\Http\Controllers;
use App\Traits\HasInertiaNotifications;
use Illuminate\Http\{JsonResponse, RedirectResponse};
use Illuminate\Support\Facades\DB;
class CitaController extends Controller
{
    use HasInertiaNotifications;
    public function proximas(): JsonResponse
    {
        [$t1, $t2, $t3] = ['mascota', 'cliente', 'motivo'];
        $data = DB::table('cita as c')
            ->leftJoin("$t1 as m", "m.id_$t1", "c.id_$t1")
            ->leftJoin("$t2 as cl", "cl.id_$t2", "m.id_$t2")
            ->leftJoin("$t3 as mo", "mo.id_$t3", "c.id_$t3")
            ->select('c.*', 'mo.motivo', 'm.mascota', 'cl.cliente')
            ->where('c.id_estado_cita', 1)
            ->where('c.fecha', '>=', now()->startOfDay())
            ->orderBy('c.fecha')
            ->get();
        return response()->json($data);
    }
    public function atender(string $id): RedirectResponse
    {
        return $this->updateEstado($id, 2, 'Cita atendida correctamente.');
    }
    public function cancelar(string $id): RedirectResponse
    {
        return $this->updateEstado($id, 3, 'Cita cancelada correctamente.');
    }
    private function updateEstado(string $id, int $estado, string $msg, string $type = 'success'): RedirectResponse
    {
        DB::table('cita')->where('id_cita', $id)->update(['id_estado_cita' => $estado]);
        return $this->notifyAndRedirect($msg, $type);
    }
}