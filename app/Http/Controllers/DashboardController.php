<?php
namespace App\Http\Controllers;
use App\Traits\HasTableMetadata;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Schema};
use Inertia\Inertia;
class DashboardController extends Controller
{
    use HasTableMetadata;
    private const PRIMARY_KEYS = ['cliente', 'mascota', 'cita', 'historia'];
    private const SECONDARY_KEYS = ['producto', 'procedimiento', 'categoria_producto', 'categoria_procedimiento', 'especie', 'raza', 'motivo'];
    public function index()
    {
        $allMetadata = collect($this->getTableMetadata(includeStats: true))->keyBy('name');
        $keys = array_merge(self::PRIMARY_KEYS, self::SECONDARY_KEYS);
        $cards = collect($keys)
            ->filter(fn($table) => $allMetadata->has($table))
            ->map(fn($table) => [
                ...$allMetadata[$table],
                'isPrimary' => in_array($table, self::PRIMARY_KEYS, true),
            ])
            ->values()
            ->all();
        return Inertia::render('dashboard', compact('cards'));
    }
    public function metrics(Request $request, string $table)
    {
        if (!Schema::hasTable($table) || $this->isProtected($table)) {
            return response()->json(['count' => 0, 'series' => []]);
        }
        $from = $request->input('from');
        $to = $request->input('to');
        $baseQuery = DB::table($table)
            ->when($from, fn($q) => $q->where("{$table}.created_at", '>=', "{$from} 00:00:00"))
            ->when($to,   fn($q) => $q->where("{$table}.created_at", '<=', "{$to} 23:59:59"));
        $count = (clone $baseQuery)->count();
        $groupFormat = ($from || $to) ? '%Y-%m-%d' : '%Y-%m';
        $series = (clone $baseQuery)
            ->selectRaw("DATE_FORMAT({$table}.created_at, '{$groupFormat}') as date, COUNT(*) as aggregate")
            ->whereNotNull("{$table}.created_at")
            ->groupBy(DB::raw("DATE_FORMAT({$table}.created_at, '{$groupFormat}')"))
            ->orderBy('date', 'asc')
            ->get()
            ->map(fn($item) => ['x' => (string) $item->date, 'y' => (int) $item->aggregate]);
        return response()->json(['count' => $count, 'series' => $series]);
    }
}