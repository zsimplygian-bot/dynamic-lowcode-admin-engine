<?php
namespace App\Http\Controllers;
use App\Services\TableMetadata;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
class DashboardController extends Controller
{
    private const PRIMARY = ['cliente', 'mascota', 'cita', 'historia'];
    private const SECONDARY = ['producto', 'procedimiento', 'categoria_producto', 'categoria_procedimiento', 'especie', 'raza', 'motivo'];
    public function index()
    {
        $meta = collect(TableMetadata::all(includeStats: true))->keyBy('name');
        $cards = collect([...self::PRIMARY, ...self::SECONDARY])
            ->filter(fn ($t) => isset($meta[$t]))
            ->map(fn ($t) => [...$meta[$t], 'isPrimary' => in_array($t, self::PRIMARY, true)])
            ->values();
        return Inertia::render('dashboard', compact('cards'));
    }
    public function metrics(Request $request, string $table)
    {
        $fmt = ($request->filled('from') || $request->filled('to')) ? '%Y-%m-%d' : '%Y-%m';
        $query = DB::table('audit')
            ->where('table', TableMetadata::id($table)) ->where('action', 's')
            ->when($request->input('from'), fn ($q, $from) => $q->where('at', '>=', $from))->when($request->input('to'), fn ($q, $to) => $q->where('at', '<=', $to));
        $series = (clone $query)
            ->selectRaw("DATE_FORMAT(at, '{$fmt}') as x, COUNT(*) as y")
            ->groupBy('x') ->orderBy('x')
            ->get();
        return response()->json(['count' => $query->count(), 'series' => $series]);
    }
}