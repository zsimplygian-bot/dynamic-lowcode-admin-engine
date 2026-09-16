<?php
namespace App\Traits;
use Illuminate\Support\Facades\Cache;
trait HasTableMetadata
{
    use HasSchemaCache, InfersColumnDefinition, HasExtraColumns;
    protected array $hiddenByDefault = ['creater_id', 'updated_at', 'updater_id'];
    protected array $nonSearchableColumns = ['creater_id', 'created_at', 'updater_id', 'updated_at'];
    protected array $nonSearchableTypes = ['file', 'image'];
    public function getTableMetadata(string $table): array
    {
        return Cache::rememberForever("schema_datatable_columns_v1_{$table}", function () use ($table) {
            $columns = [];
            foreach ($this->getTableColumns($table) as $col) {
                $base = $this->buildBaseColumnDefinition($col, $table);
                $name = $base['name'];
                $type = $base['type'] ?? 'text';
                $isForeign = $base['is_foreign'];
                $searchable = !in_array($name, $this->nonSearchableColumns, true) && !in_array($type, $this->nonSearchableTypes, true);
                $hidden = $isForeign || in_array($name, $this->hiddenByDefault, true);
                $column = [
                    'accessor' => $name,
                    'header' => $base['label'],
                    'type' => $type,
                ];
                if ($searchable) $column['searchable'] = true;
                if ($hidden) $column['hidden'] = true;
                $columns[] = $column;
                if ($isForeign) {
                    $relatedName = substr($name, 3);
                    $columns[] = [
                        'accessor' => $relatedName,
                        'header' => $this->inferLabel($relatedName, null, false),
                    ];
                }
            }
            $this->appendExtraColumnsToMetadata($table, $columns);
            return $columns;
        });
    }
}