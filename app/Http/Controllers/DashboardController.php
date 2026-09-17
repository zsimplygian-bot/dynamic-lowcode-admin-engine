<?php
namespace App\Http\Controllers;

use App\Traits\{HasDynamicQuery, HasTableMetadata};
use Illuminate\Http\{JsonResponse, Request};
use Illuminate\Support\Facades\DB;
use Inertia\{Inertia, Response};

class DashboardController extends Controller
{
    use HasDynamicQuery, HasTableMetadata;

    private const DASHBOARD_TABLES = [
        'cliente', 'mascota', 'cita', 'historia', 'producto',
        'procedimiento', 'categoria_producto', 'categoria_procedimiento',
        'especie', 'raza', 'motivo',
    ];

    public function index(): Response
    {
        $selects = collect(self::DASHBOARD_TABLES)
            ->map(fn($table) => "(SELECT COUNT(*) FROM {$table}) AS {$table}")
            ->implode(', ');

        $counts = (array) DB::selectOne("SELECT {$selects}");

        return Inertia::render('dashboard', compact('counts'));
    }

    public function metrics(Request $request, string $table): JsonResponse
{
    if (!$this->hasTableInSchema($table)) {
        return response()->json(['count' => 0, 'series' => []]);
    }

    $columns = $this->getTableMetadata($table);
    $query = $this->buildTableQuery($request, $table, $columns);

    $count = (clone $query)->count();

    // Limpiamos los SELECT e joins con query vacía sobre la tabla base
    $series = DB::table($table)
        ->when($request->input('from'), fn($q, $f) => $q->where("{$table}.created_at", '>=', "{$f} 00:00:00"))
        ->when($request->input('to'),   fn($q, $t) => $q->where("{$table}.created_at", '<=', "{$t} 23:59:59"))
        ->selectRaw("DATE({$table}.created_at) as date, COUNT(*) as aggregate")
        ->whereNotNull("{$table}.created_at")
        ->groupBy('date')
        ->orderBy('date', 'asc')
        ->limit(10)
        ->get()
        ->map(fn ($item) => ['x' => $item->date, 'y' => (int) $item->aggregate]);

    return response()->json(['count' => $count, 'series' => $series]);
}
}