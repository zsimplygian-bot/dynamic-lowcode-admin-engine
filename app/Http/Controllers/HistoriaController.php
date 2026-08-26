<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class HistoriaController extends Controller
{
    public function pdf(int $id)
    {
        $historiaData = DB::table('historia as h')
            ->leftJoin('motivo as m', 'm.id_motivo', '=', 'h.id_motivo')
            ->leftJoin('estado_historia as eh', 'eh.id_estado_historia', '=', 'h.id_estado_historia')
            ->leftJoin('mascota as mas', 'mas.id_mascota', '=', 'h.id_mascota')
            ->leftJoin('cliente as c', 'c.id_cliente', '=', 'mas.id_cliente')
            ->leftJoin('sexo as s', 's.id_sexo', '=', 'mas.id_sexo')
            ->leftJoin('raza as r', 'r.id_raza', '=', 'mas.id_raza')
            ->leftJoin('especie as e', 'e.id_especie', '=', 'r.id_especie')
            ->where('h.id_historia', $id)
            ->select([
                'h.id_historia', 'h.created_at', 'h.detalle',
                'm.motivo as motivo_nombre',
                'eh.estado_historia as estado_historia_nombre',
                'mas.mascota as mascota_nombre', 'mas.fecha_nacimiento as mascota_fecha_nacimiento',
                'mas.peso as mascota_peso', 'mas.created_at as mascota_created_at',
                'c.cliente as cliente_nombre', 'c.telefono as cliente_telefono', 'c.direccion as cliente_direccion',
                's.sexo as sexo_nombre',
                'r.raza as raza_nombre',
                'e.especie as especie_nombre',
            ])
            ->first();

        if (!$historiaData) {
            abort(404, 'Historia clínica no encontrada.');
        }

        // Carga de imagen a Base64
        $logoPath = public_path('img/logo.png');
        $logo = file_exists($logoPath)
            ? 'data:image/' . pathinfo($logoPath, PATHINFO_EXTENSION) . ';base64,' . base64_encode(file_get_contents($logoPath))
            : null;

        // Cálculo de edad
        $edadFmt = 'N/A';
        if ($historiaData->mascota_fecha_nacimiento) {
            $diff = Carbon::parse($historiaData->mascota_fecha_nacimiento)->diff(now());
            $edadFmt = match (true) {
                $diff->y < 1 => $diff->m . ' ' . ($diff->m === 1 ? 'mes' : 'meses'),
                $diff->m === 0 => $diff->y . ' ' . ($diff->y === 1 ? 'año' : 'años'),
                default => "{$diff->y} " . ($diff->y === 1 ? 'año' : 'años') . " y {$diff->m} " . ($diff->m === 1 ? 'mes' : 'meses'),
            };
        }

        // Estructura de objetos
        $cliente = (object) [
            'cliente'   => $historiaData->cliente_nombre,
            'telefono'  => $historiaData->cliente_telefono,
            'direccion' => $historiaData->cliente_direccion,
        ];

        $mascota = (object) [
            'mascota'          => $historiaData->mascota_nombre,
            'peso'             => $historiaData->mascota_peso,
            'fecha_nacimiento' => $historiaData->mascota_fecha_nacimiento,
            'created_at'       => $historiaData->mascota_created_at,
            'sexo'             => (object) ['sexo' => $historiaData->sexo_nombre],
            'raza'             => (object) [
                'raza'    => $historiaData->raza_nombre,
                'especie' => (object) ['especie' => $historiaData->especie_nombre],
            ],
        ];

        $historia = (object) [
            'id'              => $historiaData->id_historia,
            'created_at'      => $historiaData->created_at ? Carbon::parse($historiaData->created_at) : null,
            'detalle'         => $historiaData->detalle,
            'motivo'          => (object) ['motivo' => $historiaData->motivo_nombre],
            'estado_historia' => (object) ['estado_historia' => $historiaData->estado_historia_nombre],
        ];

        // Consultas auxiliares (Tablas en singular)
        $seguimientos = DB::table('historia_seguimiento')->where('id_historia', $id)->get();

        $procedimientos = DB::table('historia_procedimiento as hp')
            ->leftJoin('procedimiento as p', 'p.id_procedimiento', '=', 'hp.id_procedimiento')
            ->where('hp.id_historia', $id)
            ->select('hp.*', 'p.procedimiento as procedimiento_nombre')
            ->get();

        $productos = DB::table('historia_producto as hp')
            ->leftJoin('producto as p', 'p.id_producto', '=', 'hp.id_producto')
            ->where('hp.id_historia', $id)
            ->select('hp.*', 'p.producto as producto_nombre')
            ->get();

        $dosisGrouped = collect();
        if ($productos->isNotEmpty()) {
            $dosisGrouped = DB::table('historia_producto_dosis as hpd')
                ->leftJoin('producto as p', 'p.id_producto', '=', 'hpd.id_producto')
                ->whereIn('hpd.id_historia_producto', $productos->pluck('id_historia_producto'))
                ->select('hpd.*', 'p.producto as producto_nombre')
                ->get()
                ->groupBy('id_historia_producto');
        }

        $anamnesis = DB::table('historia_anamnesis')->where('id_historia', $id)->get();

        $na = fn($v) => filled($v) ? $v : null;
        $fmt = fn($d) => $d ? Carbon::parse($d)->format('d/m/Y H:i') : null;

        // Construcción de la línea de tiempo
        $actividades = collect()
            ->concat($seguimientos->map(fn($s) => [
                'fecha_raw' => $s->fecha,
                'tipo'      => 'Seguimiento',
                'detalle'   => array_values(array_filter([
                    $na($s->detalle) ? "Detalle: {$s->detalle}" : null,
                    $na($s->observaciones) ? "Observaciones: {$s->observaciones}" : null,
                ])),
                'precio'    => 0,
            ]))
            ->concat($procedimientos->map(fn($p) => [
                'fecha_raw' => $p->fecha,
                'tipo'      => 'Procedimiento',
                'detalle'   => array_values(array_filter([
                    $na($p->procedimiento_nombre) ? "Procedimiento: {$p->procedimiento_nombre}" : null,
                    $na($p->detalle) ? "Detalle: {$p->detalle}" : null,
                    $p->precio ? "Precio: S/ " . number_format($p->precio, 2) : null,
                ])),
                'precio'    => $p->precio ?? 0,
            ]))
            ->concat($productos->map(function($m) use ($dosisGrouped, $na, $fmt) {
                $dosisList = $dosisGrouped->get($m->id_historia_producto, collect());
                $dosisDetalles = $dosisList->flatMap(fn($d) => array_filter([
                    $na($d->producto_nombre) ? "Producto Dosis: {$d->producto_nombre}" : null,
                    $na($d->cantidad) ? "Cantidad: {$d->cantidad}" : null,
                    $na($d->unidad) ? "Unidad: {$d->unidad}" : null,
                    $na($d->via) ? "Vía: {$d->via}" : null,
                    $na($d->frecuencia) ? "Frecuencia: {$d->frecuencia}" : null,
                    $fmt($d->fecha) ? "Fecha: " . $fmt($d->fecha) : null,
                ]))->toArray();

                return [
                    'fecha_raw' => $m->fecha,
                    'tipo'      => 'Producto',
                    'detalle'   => array_merge(
                        array_values(array_filter([
                            $na($m->producto_nombre) ? "Producto: {$m->producto_nombre}" : null,
                            $na($m->dosis) ? "Dosis: {$m->dosis}" : null,
                            $m->precio ? "Precio: S/ " . number_format($m->precio, 2) : null,
                            $na($m->observaciones) ? "Observaciones: {$m->observaciones}" : null,
                        ])),
                        $dosisDetalles
                    ),
                    'precio'    => $m->precio ?? 0,
                ];
            }))
            ->concat($anamnesis->map(fn($a) => [
                'fecha_raw' => $a->fecha,
                'tipo'      => 'Anamnesis',
                'detalle'   => array_values(array_filter([
                    $na($a->temperatura) ? "Temperatura: {$a->temperatura} °C" : null,
                    $na($a->frecuencia_cardiaca) ? "Frecuencia cardiaca: {$a->frecuencia_cardiaca} lpm" : null,
                    $na($a->frecuencia_respiratoria) ? "Frecuencia respiratoria: {$a->frecuencia_respiratoria} rpm" : null,
                    $na($a->tiempo_llenado_capilar) ? "TLC: {$a->tiempo_llenado_capilar} seg" : null,
                ])),
                'precio'    => 0,
            ]))
            ->sortBy('fecha_raw')
            ->values();

        $total = $actividades->sum('precio');

        $pdf = Pdf::loadView('pdf.historia', compact('historia', 'mascota', 'cliente', 'edadFmt', 'actividades', 'total', 'logo'));
        return $pdf->stream("historia_clinica_{$id}.pdf");
    }
}