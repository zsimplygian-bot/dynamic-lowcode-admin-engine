<?php
namespace App\Http\Controllers\Settings;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
class NavigationController extends Controller
{
    private string $filePath = 'settings/navigation.json';
    public static function form(array $initialData = []): array
    {
        return [
            'method' => 'post',
            'url' => route('navigation.update'),
            'initialValues' => [
                'mainNavItems' => $initialData['mainNavItems'] ?? [],
                'headerNavItems' => $initialData['headerNavItems'] ?? [],
            ],
        ];
    }
    private function getNavigationData(): array
    {
        if (Storage::disk('local')->exists($this->filePath)) {
            $json = json_decode(Storage::disk('local')->get($this->filePath), true);
            if (is_array($json)) {
                return [
                    'mainNavItems' => $json['mainNavItems'] ?? [],
                    'headerNavItems' => $json['headerNavItems'] ?? [],
                ];
            }
        }
        return [
            'mainNavItems' => [],
            'headerNavItems' => [],
        ];
    }
    private function saveNavigationData(array $data): void
    {
        Storage::disk('local')->put(
            $this->filePath,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
    }
    private function notifyAndRedirect(string $message, string $type = 'success'): RedirectResponse
    {
        Inertia::flash('toast', [
            'type' => $type,
            'message' => __($message),
        ]);
        return back();
    }
    private function getNextId(array $items): int
    {
        $maxId = collect($items)
            ->pluck('id')
            ->filter('is_numeric')
            ->max();
        return $maxId ? ((int) $maxId + 1) : 1;
    }
    private function itemRules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'href' => 'required|string|max:255',
            'icon' => 'nullable|string|max:255',
        ];
    }
    public function edit(): Response
    {
        $data = $this->getNavigationData();
        $mainNavItems = collect($data['mainNavItems'])->map(fn($item) => [
            'id' => (string) ($item['id'] ?? ''),
            'title' => $item['title'] ?? '',
            'href' => $item['href'] ?? '',
            'icon' => $item['icon'] ?? 'LayoutGrid',
        ])->all();
        return Inertia::render('settings/navigation', [
            'mainNavItems' => $mainNavItems,
            'headerNavItems' => $data['headerNavItems'],
        ]);
    }
    // Reordenamiento masivo
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'mainNavItems' => 'nullable|array',
            'mainNavItems.*.id' => 'nullable',
            'mainNavItems.*.title' => 'required|string|max:255',
            'mainNavItems.*.href' => 'required|string|max:255',
            'mainNavItems.*.icon' => 'nullable|string|max:255',
            'headerNavItems' => 'nullable|array',
            'headerNavItems.*.id' => 'nullable',
            'headerNavItems.*.title' => 'required|string|max:255',
            'headerNavItems.*.href' => 'required|string|max:255',
            'headerNavItems.*.icon' => 'nullable|string|max:255',
        ]);
        $data = $this->getNavigationData();
        $nextId = $this->getNextId($data['mainNavItems']);
        $mainNav = collect($validated['mainNavItems'] ?? [])->map(function ($item) use (&$nextId) {
            return [
                'id' => (string) ($item['id'] ?? $nextId++),
                'title' => $item['title'],
                'href' => $item['href'],
                'icon' => $item['icon'] ?? 'LayoutGrid',
            ];
        })->values()->all();
        $this->saveNavigationData([
            'mainNavItems' => $mainNav,
            'headerNavItems' => $validated['headerNavItems'] ?? [],
        ]);
        return $this->notifyAndRedirect('Orden de navegación guardado.');
    }
    // Crear un nuevo elemento
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->itemRules());
        $data = $this->getNavigationData();
        $newId = $this->getNextId($data['mainNavItems']);
        $data['mainNavItems'][] = [
            'id' => (string) $newId,
            'title' => $validated['title'],
            'href' => $validated['href'],
            'icon' => $validated['icon'] ?? 'LayoutGrid',
        ];
        $this->saveNavigationData($data);
        return $this->notifyAndRedirect('Elemento de navegación creado.');
    }
    // Actualizar elemento por ID
    public function updateItem(Request $request, string $key): RedirectResponse
    {
        $validated = $request->validate($this->itemRules());
        $data = $this->getNavigationData();
        $items = collect($data['mainNavItems']);
        $foundIndex = $items->search(fn($item) => isset($item['id']) && (string) $item['id'] === (string) $key);
        if ($foundIndex !== false) {
            $data['mainNavItems'][$foundIndex] = [
                'id' => (string) $key,
                'title' => $validated['title'],
                'href' => $validated['href'],
                'icon' => $validated['icon'] ?? 'LayoutGrid',
            ];
            $this->saveNavigationData($data);
            return $this->notifyAndRedirect('Elemento actualizado.');
        }
        return back();
    }
    // Eliminar elemento por ID
    public function destroy(string $key): RedirectResponse
    {
        $data = $this->getNavigationData();
        $filteredItems = collect($data['mainNavItems'])
            ->reject(fn($item) => isset($item['id']) && (string) $item['id'] === (string) $key)
            ->values()
            ->all();
        if (count($filteredItems) !== count($data['mainNavItems'])) {
            $data['mainNavItems'] = $filteredItems;
            $this->saveNavigationData($data);
            return $this->notifyAndRedirect('Elemento eliminado.');
        }
        return back();
    }
}