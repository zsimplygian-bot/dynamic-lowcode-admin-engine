<?php

namespace App\Http\Controllers;

use App\Traits\HasSchemaCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class DynamicFormSchemaController extends Controller
{
    use HasSchemaCache;

    private const TYPE_MAPPING = [
        'text' => 'textarea', 'mediumtext' => 'textarea', 'longtext' => 'textarea',
        'integer' => 'number', 'bigint' => 'number', 'smallint' => 'number', 'tinyint' => 'number',
        'decimal' => 'number', 'float' => 'number', 'double' => 'number',
        'string' => 'text',
        'boolean' => 'checkbox',
        'date' => 'date', 'datetime' => 'datetime-local', 'timestamp' => 'datetime-local', 'time' => 'time',
    ];

    private const IGNORED_COLUMNS = [
        'created_at' => true, 'updated_at' => true, 'deleted_at' => true,
        'remember_token' => true, 'creater_id' => true, 'updater_id' => true,
        'deleter_id' => true, 'user_id_created' => true
    ];

    private const FILE_KEYWORDS  = ['archivo', 'imagen', 'icon', 'logo', 'avatar', 'photo', 'foto'];
    private const EMAIL_KEYWORDS = ['email', 'correo'];
    private const PHONE_KEYWORDS = ['telefono', 'celular', 'phone'];
    private const PASS_KEYWORDS  = ['password', 'clave'];

    public function getTableSchema(string $table): array
    {
        // Cachea el JSON de campos ya procesado (etiquetas, tipos inferidos, etc.)
        return Cache::rememberForever("compiled_schema_{$table}", function () use ($table) {
            $rawColumns = $this->getRawTableColumns($table);
            if (empty($rawColumns)) return [];

            $fields = [];
            foreach ($rawColumns as $col) {
                $name = $col['name'];
                if (isset(self::IGNORED_COLUMNS[$name])) continue;

                $dbType = strtolower($col['type_name'] ?? 'string');
                $fullType = strtolower($col['type'] ?? '');
                $inputType = self::TYPE_MAPPING[$dbType] ?? 'text';

                if ($dbType === 'tinyint' && str_contains($fullType, 'tinyint(1)')) {
                    $inputType = 'checkbox';
                }

                $isPK = $name === 'id' || $name === "id_{$table}";
                $isFK = !$isPK && (Str::startsWith($name, 'id_') || Str::endsWith($name, '_id'));

                if (Str::contains($name, self::FILE_KEYWORDS)) {
                    $inputType = 'image';
                } elseif ($isPK) {
                    $inputType = 'hidden';
                } elseif ($isFK) {
                    $inputType = 'select';
                } elseif ($inputType === 'text' || $inputType === 'textarea') {
                    if (Str::contains($name, self::EMAIL_KEYWORDS)) {
                        $inputType = 'email';
                    } elseif (Str::contains($name, self::PHONE_KEYWORDS)) {
                        $inputType = 'tel';
                    } elseif (Str::contains($name, self::PASS_KEYWORDS)) {
                        $inputType = 'password';
                    }
                }

                $label = Str::upper(str_replace('_', ' ', $name));
                if (!empty($col['comment']) && preg_match("/label\s*:\s*['\"]([^'\"]+)['\"]/i", $col['comment'], $match)) {
                    $label = Str::upper($match[1]);
                }

                $fieldData = [
                    'name'     => $name,
                    'label'    => $label,
                    'type'     => $inputType,
                    'required' => !($col['nullable'] ?? true) && $inputType !== 'hidden',
                ];

                if ($inputType === 'image') {
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

        return response()->json([
            'tableName' => $table,
            'fields'    => $schema,
        ]);
    }
}