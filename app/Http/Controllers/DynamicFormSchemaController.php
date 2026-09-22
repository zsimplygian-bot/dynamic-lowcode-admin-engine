<?php
namespace App\Http\Controllers;

use App\Traits\HasSchemaCache;
use App\Traits\InfersColumnDefinition;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class DynamicFormSchemaController extends Controller
{
    use HasSchemaCache, InfersColumnDefinition;

    public function getTableSchema(string $table): array
    {
        return Cache::rememberForever("schema_form_fields_v2_{$table}", function () use ($table) {
            $fields = [];
            foreach ($this->getTableColumns($table) as $col) {
                $base = $this->buildBaseColumnDefinition($col, $table);
                $name = $base['name'];

                if ($this->isSystemColumn($name)) continue;

                $isPrimary = $base['is_primary'];
                $type = $isPrimary ? 'hidden' : $base['ui_type'];
                $label = $base['label'] . ($type === 'checkbox' ? '?' : '');

                $fieldData = [
                    'name'  => $name,
                    'label' => $label,
                    'type'  => $type,
                ];

                if (!empty($base['options'])) $fieldData['options'] = $base['options'];
                if (!$base['is_nullable'] && !$isPrimary) $fieldData['required'] = true;
                if ($type === 'file') {
                    $fieldData['accept'] = Str::contains($name, self::IMAGE_KEYWORDS) ? 'image/*' : '*/*';
                }

                $fields[] = $fieldData;
            }
            return $fields;
        });
    }

    public function fields(string $table): JsonResponse { return response()->json($this->getTableSchema($table)); }
}