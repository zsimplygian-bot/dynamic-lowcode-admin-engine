<?php
namespace App\Traits;
use Illuminate\Support\Facades\Cache;
trait HasTableMetadata
{
    use HasSchemaCache, InfersColumnDefinition, HasExtraColumns;
    protected const HIDDEN_BY_DEFAULT    = ['creater_id', 'updated_at', 'updater_id'];
    protected const NON_SEARCHABLE_COLS  = ['creater_id', 'created_at', 'updater_id', 'updated_at'];
    protected const NON_SEARCHABLE_TYPES = ['file', 'image'];
    public function getTableMetadata(string $table): array
    {
        return Cache::rememberForever("schema_datatable_columns_v1_{$table}", function () use ($table) {
            $columns = [];
            foreach ($this->getTableColumns($table) as $col) {
                $base      = $this->buildBaseColumnDefinition($col, $table);
                $name      = $base['name'];
                $type      = $base['type'];
                $isForeign = $base['is_foreign'];
                $column = [
                    'accessor' => $name,
                    'header'   => $base['label'],
                    'type'     => $type,
                ];
                if (!in_array($name, self::NON_SEARCHABLE_COLS, true) && !in_array($type, self::NON_SEARCHABLE_TYPES, true)) { $column['searchable'] = true; }
                if ($isForeign || in_array($name, self::HIDDEN_BY_DEFAULT, true)) { $column['hidden'] = true; }
                $columns[] = $column;
                if ($isForeign) {
                    $relatedName = substr($name, 3);
                    $columns[] = [
                        'accessor' => $relatedName,
                        'header'   => $this->inferLabel($relatedName, null, false),
                    ];
                }
            }
            $this->appendExtraColumnsToMetadata($table, $columns);
            return $columns;
        });
    }
}