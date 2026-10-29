<?php
namespace App\Http\Controllers;
use App\Services\TableMetadata;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
class NavigationController extends Controller
{
    public function __invoke() { return response()->json($this->getNavigation()); }
    public function getNavigation(): array
    {
        return Cache::rememberForever('inertia_main_nav_items', function () {
            $tables = collect(TableMetadata::all())->keyBy('name');
            $item = fn (string $name) => [
                'title' => Str::ucfirst($tables[$name]['label'] ?? $name),
                'href'  => "/table/{$name}",
                'icon'  => $tables[$name]['icon'] ?? 'table', ];
            return [
                ['title' => 'Dashboard', 'href' => '/dashboard', 'icon' => 'layout-grid'],
                ...array_map($item, ['historia', 'cita', 'mascota', 'cliente']),
                [   'title' => 'Items',
                    'icon'  => 'folder-tree',
                    'items' => array_map($item, ['procedimiento', 'producto', 'categoria_procedimiento', 'categoria_producto', 'raza', 'especie', 'motivo']), ],
                ['title' => 'Audit', 'href' => '/table/audit', 'icon' => 'layout-grid'],
            ];
        });
    }
}