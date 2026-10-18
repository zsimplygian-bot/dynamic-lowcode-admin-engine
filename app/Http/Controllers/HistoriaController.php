<?php

namespace App\Http\Controllers;

use App\Traits\FormatsDateDifference;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\{DB, Storage};

class HistoriaController extends Controller
{
    use FormatsDateDifference;

    public function pdf(int $id)
    {
        $data = $this->obtenerDatosHistoria($id);
        if (!$data) abort(404, 'Historia clínica no encontrada.');

        $edadFmt = $this->formatYearsAndMonths($data->fecha_nacimiento);
        $cliente = (object) [
            'cliente' => $data->cliente,
            'telefono' => $data->telefono,
            'direccion' => $data->direccion,
        ];

        $mascota = (object) [
            'mascota' => $data->mascota,
            'peso' => $data->peso,
            'fecha_nacimiento' => $data->fecha_nacimiento,
            'sexo' => (object) ['sexo' => $data->sexo],
            'raza' => (object) [
                'raza' => $data->raza,
                'especie' => (object) ['especie' => $data->especie],
            ],
        ];

        $historia = (object) [
            'id' => $data->id,
            'detalle' => $data->historia,
            'motivo' => (object) ['motivo' => $data->motivo],
            'estado_historia' => (object) ['estado_historia' => $data->estado_historia],
        ];

        $actividades = $this->obtenerActividadesHistoria($id)
            ->sortBy('fecha_raw')
            ->map(fn($act) => [
                'fecha_raw' => $act['fecha_raw'],
                'tipo' => $act['tipo'],
                'detalle' => $this->formatearDetallePDF($act),
                'precio' => (float) $act['precio'],
            ])->values();

        $total = $actividades->sum('precio');

        $pdf = Pdf::loadView('pdf.historia', compact('historia', 'mascota', 'cliente', 'edadFmt', 'actividades', 'total'))
            ->setPaper('a4');

        return $pdf->stream("historia_clinica_{$id}.pdf");
    }

    public function actividades(int $id)
    {
        $actividades = $this->obtenerActividadesHistoria($id)
            ->sortByDesc('fecha_raw')
            ->map(fn($act) => [
                'id' => $act['id'],
                'item' => match ($act['tipo']) {
                    'Procedimiento' => 'Procedimientos',
                    'Producto' => 'Productos',
                    default => $act['tipo'],
                },
                'tabla' => 'historia_' . strtolower($act['tipo']),
                'titulo' => $act['titulo'],
                'detalle' => $this->formatearDetalleJson($act),
                'precio' => (float) $act['precio'],
                'fecha_dia' => $act['fecha_raw'] ? Carbon::parse($act['fecha_raw'])->toDateString() : null,
                'fecha' => $act['fecha_raw'],
            ])->values();

        return response()->json($actividades);
    }

    private function obtenerDatosHistoria(int $id): ?object
    {
        return DB::table('historia as h')
            ->join('motivo as m', 'm.id', '=', 'h.motivo_id')
            ->join('estado_historia as eh', 'eh.id', '=', 'h.estado_historia_id')
            ->join('mascota as mas', 'mas.id', '=', 'h.mascota_id')
            ->join('sexo as s', 's.id', '=', 'mas.sexo_id')
            ->join('cliente as c', 'c.id', '=', 'mas.cliente_id')
            ->join('raza as r', 'r.id', '=', 'mas.raza_id')
            ->join('especie as e', 'e.id', '=', 'r.especie_id')
            ->where('h.id', $id)
            ->select([
                'h.id',
                'h.historia',
                'eh.estado_historia',
                'm.motivo',
                'mas.mascota',
                'mas.fecha_nacimiento',
                'mas.peso',
                's.sexo',
                'c.cliente',
                'c.telefono',
                'c.direccion',
                'r.raza',
                'e.especie',
            ])->first();
    }

    private function obtenerActividadesHistoria(int $id): Collection
    {
        $seguimientos = DB::table('historia_seguimiento')
            ->where('historia_id', $id)
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'fecha_raw' => $s->fecha,
                'tipo' => 'Seguimiento',
                'titulo' => null,
                'raw_detalle' => $s->detalle,
                'raw_obs' => $s->observaciones,
                'precio' => 0.0,
            ]);

        $procedimientos = DB::table('historia_procedimiento as hp')
            ->leftJoin('procedimiento as p', 'p.id', '=', 'hp.procedimiento_id')
            ->where('hp.historia_id', $id)
            ->select('hp.id', 'hp.fecha', 'p.procedimiento', 'hp.detalle', DB::raw('COALESCE(hp.precio, p.precio, 0) as precio'))
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'fecha_raw' => $p->fecha,
                'tipo' => 'Procedimiento',
                'titulo' => $p->procedimiento,
                'raw_detalle' => $p->detalle,
                'precio' => (float) $p->precio,
            ]);

        $productos = DB::table('historia_producto as hp')
            ->leftJoin('producto as p', 'p.id', '=', 'hp.producto_id')
            ->where('hp.historia_id', $id)
            ->select('hp.id', 'hp.fecha', 'p.producto', 'hp.dosis', 'hp.observaciones', DB::raw('COALESCE(hp.precio, p.precio, 0) as precio'))
            ->get();

        $dosisGrouped = $productos->isNotEmpty()
            ? DB::table('historia_producto_dosis as hpd')
                ->leftJoin('producto as p', 'p.id', '=', 'hpd.producto_id')
                ->whereIn('hpd.historia_producto_id', $productos->pluck('id'))
                ->select('hpd.*', 'p.producto')
                ->get()
                ->groupBy('historia_producto_id')
            : collect();

        $productosMapped = $productos->map(fn($m) => [
            'id' => $m->id,
            'fecha_raw' => $m->fecha,
            'tipo' => 'Producto',
            'titulo' => $m->producto,
            'raw_dosis' => $m->dosis,
            'raw_obs' => $m->observaciones,
            'dosis_list' => $dosisGrouped->get($m->id, collect()),
            'precio' => (float) $m->precio,
        ]);

        $anamnesis = DB::table('historia_anamnesis')
            ->where('historia_id', $id)
            ->get()
            ->map(fn($a) => [
                'id' => $a->id,
                'fecha_raw' => $a->fecha,
                'tipo' => 'Anamnesis',
                'titulo' => null,
                'temp' => $a->temperatura,
                'fc' => $a->frecuencia_cardiaca,
                'fr' => $a->frecuencia_respiratoria,
                'tlc' => $a->tiempo_llenado_capilar,
                'precio' => 0.0,
            ]);

        return collect()->concat($seguimientos)->concat($procedimientos)->concat($productosMapped)->concat($anamnesis);
    }

    private function formatearDetallePDF(array $act): array
    {
        $d = [];
        match ($act['tipo']) {
            'Seguimiento' => tap([], function() use (&$d, $act) {
                if (filled($act['raw_detalle'] ?? null)) $d[] = "Detalle: {$act['raw_detalle']}";
                if (filled($act['raw_obs'] ?? null))     $d[] = "Observaciones: {$act['raw_obs']}";
            }),
            'Procedimiento' => tap([], function() use (&$d, $act) {
                if (filled($act['titulo'] ?? null))      $d[] = "Procedimiento: {$act['titulo']}";
                if (filled($act['raw_detalle'] ?? null)) $d[] = "Detalle: {$act['raw_detalle']}";
                if (($act['precio'] ?? 0) > 0)           $d[] = "Precio: S/ " . number_format($act['precio'], 2);
            }),
            'Producto' => tap([], function() use (&$d, $act) {
                if (filled($act['titulo'] ?? null))    $d[] = "Producto: {$act['titulo']}";
                if (filled($act['raw_dosis'] ?? null)) $d[] = "Dosis: {$act['raw_dosis']}";
                if (($act['precio'] ?? 0) > 0)         $d[] = "Precio: S/ " . number_format($act['precio'], 2);
                if (filled($act['raw_obs'] ?? null))   $d[] = "Observaciones: {$act['raw_obs']}";
                foreach ($act['dosis_list'] ?? [] as $dos) {
                    if (filled($dos->producto ?? null)) $d[] = "• Dosis: {$dos->producto} ({$dos->cantidad} {$dos->unidad}) - Vía: {$dos->via} | Frec: {$dos->frecuencia}";
                }
            }),
            'Anamnesis' => tap([], function() use (&$d, $act) {
                if (filled($act['temp'] ?? null)) $d[] = "Temp: {$act['temp']} °C | FC: {$act['fc']} lpm | FR: {$act['fr']} rpm | TLC: {$act['tlc']} seg";
            }),
            default => null,
        };
        return $d;
    }

    private function formatearDetalleJson(array $act): ?string
    {
        return match ($act['tipo']) {
            'Seguimiento'   => ($act['raw_detalle'] ?? null) ?: (($act['raw_obs'] ?? null) ?: 'Sin detalle'),
            'Procedimiento' => $act['raw_detalle'] ?? null,
            'Producto'      => filled($act['raw_dosis'] ?? null) ? "Dosis: {$act['raw_dosis']}" : null,
            'Anamnesis'     => "Temp: " . ($act['temp'] ?? 'N/A') . "°C | FC: " . ($act['fc'] ?? 'N/A') . " lpm",
            default         => null,
        };
    }
}