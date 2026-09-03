<?php
namespace App\Http\Controllers;
use App\Traits\HasSchemaCache;
use App\Traits\InfersColumnDefinition;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
class DynamicFormSchemaController extends Controller
{
    use HasSchemaCache, InfersColumnDefinition;
    private const IGNORED_COLUMNS = [
        'created_at'        => true,
        'updated_at'        => true,
        'deleted_at'        => true,
        'remember_token'    => true,
        'creater_id'        => true,
        'creator_id'        => true,
        'updater_id'        => true,
        'deleter_id'        => true,
        'user_id_created'   => true,
    ];
    public function getTableSchema(string $table): array
    {
        return Cache::rememberForever("compiled_schema_v3_{$table}", function () use ($table) {
            $rawColumns = $this->getRawTableColumns($table);
            if (empty($rawColumns)) return [];
            $fields = [];
            foreach ($rawColumns as $col) {
                $base = $this->buildBaseColumnDefinition($col, $table);
                $name = $base['name'];
                if (isset(self::IGNORED_COLUMNS[$name])) continue;
                $isPrimary = $base['is_primary'];
                $isForeign = $base['is_foreign'];
                $type      = $isPrimary ? 'hidden' : $base['type'];
                $fieldData = [
                    'name'        => $name,
                    'label'       => $base['label'],
                    'type'        => $type,
                    'required'    => !$base['is_nullable'] && !$isPrimary,
                    'is_foreign'  => $isForeign,
                ];
                if ($type === 'image') {
                    $fieldData['accept'] = 'image/*';
                }
                $fields[] = $fieldData;
            }
            return $fields;
        });
    }
    public function fields(string $table): JsonResponse
    {
        $schema = $this->getTableSchema($table);
        if (empty($schema)) {
            return response()->json(['message' => "La tabla '{$table}' no existe o no contiene columnas registradas."], 404);
        }
        
        // Devolvemos el array directamente
        return response()->json($schema);
    }
    public function clearFormSchemaCache(string $table): void
    {
        $this->clearSchemaCache($table);
        Cache::forget("compiled_schema_v3_{$table}");
    }
}