<?php

namespace App\Http\Controllers;

use App\Traits\FormatsDateDifference;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class HistoriaController extends Controller
{
    use FormatsDateDifference;

    public function pdf(int $id)
    {
        $historiaData = $this->obtenerDatosHistoria($id);
        $logoPath = public_path('img/logo.png');
        $logo = file_exists($logoPath)
            ? 'data:image/' . pathinfo($logoPath, PATHINFO_EXTENSION) . ';base64,' . base64_encode(file_get_contents($logoPath))
            : null;
        $edadFmt = $this->formatYearsAndMonths($historiaData->fecha_nacimiento ?? null);
        $cliente = (object) [
            'cliente'   => $historiaData->cliente ?? null,
            'telefono'  => $historiaData->telefono ?? null,
            'direccion' => $historiaData->direccion ?? null,
        ];
        $mascota = (object) [
            'mascota'          => $historiaData->mascota ?? null,
            'peso'             => $historiaData->peso ?? null,
            'fecha_nacimiento' => $historiaData->fecha_nacimiento ?? null,
            'created_at'       => $historiaData->mascota_created_at ?? null,
            'sexo'             => (object) ['sexo' => $historiaData->sexo ?? null],
            'raza'             => (object) [
                'raza'    => $historiaData->raza ?? null,
                'especie' => (object) ['especie' => $historiaData->especie ?? null],
            ],
        ];
        $historia = (object) [
            'id'              => $historiaData->id_historia ?? $id,
            'created_at'      => isset($historiaData->created_at) ? Carbon::parse($historiaData->created_at) : null,
            'detalle'         => $historiaData->historia ?? null,
            'motivo'          => (object) ['motivo' => $historiaData->motivo ?? null],
            'estado_historia' => (object) ['estado_historia' => $historiaData->estado_historia ?? null],
        ];
        $actividades = $this->obtenerActividadesHistoria($id)
            ->sortBy('fecha_raw')
            ->map(fn($act) => [
                'fecha_raw' => $act['fecha_raw'],
                'tipo'      => $act['tipo'],
                'detalle'   => $this->formatearDetallePDF($act),
                'precio'    => $act['precio'],
            ])
            ->values();
        $total = $actividades->sum('precio');
        $pdf = Pdf::loadView('pdf.historia', compact('historia', 'mascota', 'cliente', 'edadFmt', 'actividades', 'total', 'logo'));
        return $pdf->stream("historia_clinica_{$id}.pdf");
    }

    public function actividades(int $id): JsonResponse
    {
        $actividades = $this->obtenerActividadesHistoria($id)
            ->sortByDesc('fecha_raw')
            ->map(fn($act) => [
                'id'        => $act['id'],
                'item'      => $act['tipo'] === 'Procedimiento' ? 'Procedimientos' : ($act['tipo'] === 'Producto' ? 'Productos' : $act['tipo']),
                'tabla'     => 'historia_' . strtolower($act['tipo']),
                'titulo'    => $act['titulo'],
                'detalle'   => $this->formatearDetalleJson($act),
                'precio'    => $act['precio'],
                'fecha_dia' => $act['fecha_raw'] ? Carbon::parse($act['fecha_raw'])->toDateString() : null,
                'fecha'     => $act['fecha_raw'],
            ])
            ->values();

        return response()->json($actividades);
    }

    private function obtenerDatosHistoria(int $id): object
    {
        [$t1, $t2, $t3, $t4, $t5, $t6, $t7] = ['motivo', 'estado_historia', 'mascota', 'cliente', 'sexo', 'raza', 'especie'];
        return DB::table('historia as h')
            ->leftJoin("$t1 as m", "m.id_$t1", "h.id_$t1")
            ->leftJoin("$t2 as eh", "eh.id_$t2", "h.id_$t2")
            ->leftJoin("$t3 as mas", "mas.id_$t3", "h.id_$t3")
            ->leftJoin("$t4 as c", "c.id_$t4", "mas.id_$t4")
            ->leftJoin("$t5 as s", "s.id_$t5", "mas.id_$t5")
            ->leftJoin("$t6 as r", "r.id_$t6", "mas.id_$t6")
            ->leftJoin("$t7 as e", "e.id_$t7", "r.id_$t7")
            ->where('h.id_historia', $id)
            ->select([
                'h.id_historia', 'h.created_at', 'h.historia',
                'm.motivo',
                'eh.estado_historia',
                'mas.mascota', 'mas.fecha_nacimiento', 'mas.peso', 'mas.created_at as mascota_created_at',
                'c.cliente', 'c.telefono', 'c.direccion',
                's.sexo',
                'r.raza',
                'e.especie',
            ])
            ->first() ?? (object) [];
    }

    private function obtenerActividadesHistoria(int $id): Collection
    {
        $seguimientos = DB::table('historia_seguimiento')
            ->where('id_historia', $id)
            ->get()
            ->map(fn($s) => [
                'id'          => $s->id_historia_seguimiento,
                'fecha_raw'   => $s->fecha,
                'tipo'        => 'Seguimiento',
                'titulo'      => null,
                'raw_detalle' => $s->detalle,
                'raw_obs'     => $s->observaciones,
                'precio'      => 0.0,
            ]);
        $tProc = 'procedimiento';
        $procedimientos = DB::table("historia_$tProc as hp")
            ->leftJoin("$tProc as p", "p.id_$tProc", "hp.id_$tProc")
            ->where('hp.id_historia', $id)
            ->select('hp.id_historia_procedimiento as id', 'hp.fecha', 'p.procedimiento', 'hp.detalle', DB::raw('COALESCE(hp.precio, p.precio, 0) as precio'))
            ->get()
            ->map(fn($p) => [
                'id'          => $p->id,
                'fecha_raw'   => $p->fecha,
                'tipo'        => 'Procedimiento',
                'titulo'      => $p->procedimiento,
                'raw_detalle' => $p->detalle,
                'precio'      => (float) $p->precio,
            ]);
        $tProd = 'producto';
        $productos = DB::table("historia_$tProd as hp")
            ->leftJoin("$tProd as p", "p.id_$tProd", "hp.id_$tProd")
            ->where('hp.id_historia', $id)
            ->select('hp.id_historia_producto as id', 'hp.fecha', 'p.producto', 'hp.dosis', 'hp.observaciones', DB::raw('COALESCE(hp.precio, p.precio, 0) as precio'))
            ->get();
        $dosisGrouped = collect();
        if ($productos->isNotEmpty()) {
            $dosisGrouped = DB::table("historia_{$tProd}_dosis as hpd")
                ->leftJoin("$tProd as p", "p.id_$tProd", "hpd.id_$tProd")
                ->whereIn('hpd.id_historia_producto', $productos->pluck('id'))
                ->select('hpd.*', 'p.producto')
                ->get()
                ->groupBy('id_historia_producto');
        }
        $productosMapped = $productos->map(fn($m) => [
            'id'          => $m->id,
            'fecha_raw'   => $m->fecha,
            'tipo'        => 'Producto',
            'titulo'      => $m->producto,
            'raw_dosis'   => $m->dosis,
            'raw_obs'     => $m->observaciones,
            'dosis_list'  => $dosisGrouped->get($m->id, collect()),
            'precio'      => (float) $m->precio,
        ]);
        $anamnesis = DB::table('historia_anamnesis')
            ->where('id_historia', $id)
            ->get()
            ->map(fn($a) => [
                'id'        => $a->id_historia_anamnesis,
                'fecha_raw' => $a->fecha,
                'tipo'      => 'Anamnesis',
                'titulo'    => null,
                'temp'      => $a->temperatura,
                'fc'        => $a->frecuencia_cardiaca,
                'fr'        => $a->frecuencia_respiratoria,
                'tlc'       => $a->tiempo_llenado_capilar,
                'precio'    => 0.0,
            ]);
        return collect()
            ->concat($seguimientos)
            ->concat($procedimientos)
            ->concat($productosMapped)
            ->concat($anamnesis);
    }

    private function formatearDetallePDF(array $act): array
    {
        $d = [];
        switch ($act['tipo']) {
            case 'Seguimiento':
                if (filled($act['raw_detalle'])) $d[] = "Detalle: {$act['raw_detalle']}";
                if (filled($act['raw_obs']))     $d[] = "Observaciones: {$act['raw_obs']}";
                break;
            case 'Procedimiento':
                if (filled($act['titulo']))      $d[] = "Procedimiento: {$act['titulo']}";
                if (filled($act['raw_detalle'])) $d[] = "Detalle: {$act['raw_detalle']}";
                if ($act['precio'] > 0)          $d[] = "Precio: S/ " . number_format($act['precio'], 2);
                break;
            case 'Producto':
                if (filled($act['titulo']))      $d[] = "Producto: {$act['titulo']}";
                if (filled($act['raw_dosis']))   $d[] = "Dosis: {$act['raw_dosis']}";
                if ($act['precio'] > 0)          $d[] = "Precio: S/ " . number_format($act['precio'], 2);
                if (filled($act['raw_obs']))     $d[] = "Observaciones: {$act['raw_obs']}";
                foreach ($act['dosis_list'] as $dos) {
                    if (filled($dos->producto)) $d[] = "Producto Dosis: {$dos->producto}";
                    if (filled($dos->cantidad)) $d[] = "Cantidad: {$dos->cantidad}";
                    if (filled($dos->unidad))   $d[] = "Unidad: {$dos->unidad}";
                    if (filled($dos->via))      $d[] = "Vía: {$dos->via}";
                    if (filled($dos->frecuencia)) $d[] = "Frecuencia: {$dos->frecuencia}";
                    if (filled($dos->fecha))    $d[] = "Fecha: " . Carbon::parse($dos->fecha)->format('d/m/Y H:i');
                }
                break;
            case 'Anamnesis':
                if (filled($act['temp'])) $d[] = "Temperatura: {$act['temp']} °C";
                if (filled($act['fc']))   $d[] = "Frecuencia cardiaca: {$act['fc']} lpm";
                if (filled($act['fr']))   $d[] = "Frecuencia respiratoria: {$act['fr']} rpm";
                if (filled($act['tlc']))  $d[] = "TLC: {$act['tlc']} seg";
                break;
        }
        return $d;
    }

    private function formatearDetalleJson(array $act): ?string
    {
        return match ($act['tipo']) {
            'Seguimiento'   => $act['raw_detalle'] ?: ($act['raw_obs'] ?: 'Sin detalle'),
            'Procedimiento' => $act['raw_detalle'],
            'Producto'      => filled($act['raw_dosis']) ? "Dosis: {$act['raw_dosis']}" : null,
            'Anamnesis'     => "Temp: " . ($act['temp'] ?? 'N/A') . "°C | FC: " . ($act['fc'] ?? 'N/A') . " lpm",
            default         => null,
        };
    }
}