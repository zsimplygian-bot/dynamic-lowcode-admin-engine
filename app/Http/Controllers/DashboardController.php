<?php
namespace App\Http\Controllers;
use App\Traits\HasTableMetadata;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
class DashboardController extends Controller
{
    use HasTableMetadata;
    private const PRIMARY_KEYS = ['cliente', 'mascota', 'cita', 'historia'];
    private const SECONDARY_KEYS = ['producto', 'procedimiento', 'categoria_producto', 'categoria_procedimiento', 'especie', 'raza', 'motivo'];
    public function index()
    {
        $meta = collect($this->getTableMetadata(includeStats: true))->keyBy('name');
        $cards = collect([...self::PRIMARY_KEYS, ...self::SECONDARY_KEYS])
            ->map(fn($table) => [...$meta[$table], 'isPrimary' => in_array($table, self::PRIMARY_KEYS, true)])
            ->values()
            ->all();
        return Inertia::render('dashboard', compact('cards'));
    }
    public function metrics(Request $request, string $table)
    {
        $fmt = ($request->input('from') || $request->input('to')) ? '%Y-%m-%d' : '%Y-%m';
        $query = DB::table('audit')->where('table', $table)->where('action', 's')
            ->when($request->input('from'), fn($q, $from) => $q->where('at', '>=', $from))->when($request->input('to'), fn($q, $to) => $q->where('at', '<=', $to));
        $series = (clone $query)
            ->selectRaw("DATE_FORMAT(at, '{$fmt}') as x, COUNT(*) as y")
            ->groupBy(DB::raw("DATE_FORMAT(at, '{$fmt}')"))
            ->orderBy('x', 'asc')
            ->get();
        return response()->json(['count' => $query->count(), 'series' => $series]);
    }
}