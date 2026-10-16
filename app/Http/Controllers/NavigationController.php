<?php
namespace App\Http\Controllers;
use App\Traits\HasTableMetadata;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
class NavigationController extends Controller
{
    use HasTableMetadata;
    public function __invoke() { return response()->json($this->getNavigation()); }
    public function getNavigation(): array
    {
        return Cache::rememberForever('inertia_main_nav_items', function () {
            $tables = collect($this->getTableMetadata())->keyBy('name');
            $makeItem = fn (string $name) => [
                'title' => Str::ucfirst($tables[$name]['label'] ?? $tables[$name]['title'] ?? $name),
                'href' => "/table/{$name}",
                'icon' => $tables[$name]['icon'] ?? 'table', ];
            return [
                ['title' => 'Dashboard', 'href' => '/dashboard', 'icon' => 'layout-grid'],
                $makeItem('historia'),
                $makeItem('cita'),
                $makeItem('mascota'),
                $makeItem('cliente'),
                [ 'title' => 'Items', 'icon' => 'folder-tree',
                  'items' => array_map($makeItem, ['procedimiento', 'producto', 'categoria_procedimiento', 'categoria_producto', 'raza', 'especie', 'motivo']), ], ];
        });
    }
}