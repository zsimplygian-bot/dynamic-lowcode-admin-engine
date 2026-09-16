<?php
namespace App\Http\Controllers;
use App\Traits\HasSchemaCache;
use App\Traits\InfersColumnDefinition;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
class DynamicFormSchemaController extends Controller
{
    use HasSchemaCache, InfersColumnDefinition;
    private const IGNORED_FIELDS = ['created_at', 'updated_at', 'creater_id', 'updater_id', 'remember_token'];
    public function getTableSchema(string $table): array
    {
        return Cache::rememberForever("schema_form_fields_v1_{$table}", function () use ($table) {
            $fields = [];
            foreach ($this->getTableColumns($table) as $col) {
                $base = $this->buildBaseColumnDefinition($col, $table);
                $name = $base['name'];
                if (in_array($name, self::IGNORED_FIELDS, true)) continue;
                $isPrimary = $base['is_primary'];
                $type = $isPrimary ? 'hidden' : $base['type'];
                $isRequired = !$base['is_nullable'] && !$isPrimary;
                $fieldData = [
                    'name' => $name,
                    'label' => $base['label'],
                    'type' => $type,
                ];
                if ($isRequired) $fieldData['required'] = true;
                if ($type === 'image') $fieldData['accept'] = 'image/*';
                $fields[] = $fieldData;
            }
            return $fields;
        });
    }
    public function fields(string $table): JsonResponse { return response()->json($this->getTableSchema($table)); }
}