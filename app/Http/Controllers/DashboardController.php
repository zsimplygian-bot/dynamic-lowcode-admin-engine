<?php

namespace App\Http\Controllers;

use App\Traits\HasTableMetadata;
use Illuminate\Http\{JsonResponse, Request};
use Illuminate\Support\Facades\DB;
use Inertia\{Inertia, Response};

class DashboardController extends Controller
{
    use HasTableMetadata;

    private const DASHBOARD_TABLES = [
        'cliente', 'mascota', 'cita', 'historia', 'producto',
        'procedimiento', 'categoria_producto', 'categoria_procedimiento',
        'especie', 'raza', 'motivo',
    ];

    public function index(): Response
    {
        $validTables = collect(self::DASHBOARD_TABLES)->filter(fn($table) => $this->hasTableInSchema($table));

        $selects = $validTables
            ->map(fn($table) => "(SELECT COUNT(*) FROM {$table}) AS {$table}")
            ->implode(', ');

        $counts = $selects ? (array) DB::selectOne("SELECT {$selects}") : [];

        return Inertia::render('dashboard', compact('counts'));
    }

    public function metrics(Request $request, string $table): JsonResponse
{
    if (!$this->hasTableInSchema($table)) {
        return response()->json(['count' => 0, 'series' => []]);
    }

    $from = $request->input('from');
    $to = $request->input('to');

    $baseQuery = DB::table($table)
        ->when($from, fn($q) => $q->where("{$table}.created_at", '>=', "{$from} 00:00:00"))
        ->when($to,   fn($q) => $q->where("{$table}.created_at", '<=', "{$to} 23:59:59"));

    $count = (clone $baseQuery)->count();

    // Si hay un rango de fechas explícito se agrupa por día (YYYY-MM-DD), si no, por mes (YYYY-MM)
    $groupFormat = ($from || $to) ? '%Y-%m-%d' : '%Y-%m';

    $series = (clone $baseQuery)
        ->selectRaw("DATE_FORMAT({$table}.created_at, '{$groupFormat}') as date, COUNT(*) as aggregate")
        ->whereNotNull("{$table}.created_at")
        ->groupBy(DB::raw("DATE_FORMAT({$table}.created_at, '{$groupFormat}')"))
        ->orderBy('date', 'asc')
        ->get()
        ->map(fn($item) => [
            'x' => (string) $item->date,
            'y' => (int) $item->aggregate
        ]);

    return response()->json([
        'count'  => $count,
        'series' => $series
    ]);
}
}