<?php
namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
class DashboardController extends Controller
{
    public function index(): Response
    {
        $tables = [
            'cliente',
            'mascota',
            'cita',
            'historia',
            'producto',
            'procedimiento',
            'categoria_producto',
            'categoria_procedimiento',
            'especie',
            'raza',
            'motivo',
        ];
        $selects = collect($tables)
            ->map(fn($table) => "(SELECT COUNT(*) FROM {$table}) AS {$table}")
            ->implode(', ');
        $counts = (array) DB::selectOne("SELECT {$selects}");
        return Inertia::render('dashboard', compact('counts'));
    }
}