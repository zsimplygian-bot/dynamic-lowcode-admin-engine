<?php
namespace App\Traits;
use Illuminate\Support\Str;
trait InfersColumnDefinition
{
    protected const TYPE_MAPPING = [
        'number'         => ['int', 'integer', 'bigint', 'smallint', 'tinyint', 'mediumint', 'int4', 'int8', 'decimal', 'numeric', 'float', 'double', 'real'],
        'textarea'       => ['text', 'mediumtext', 'longtext'],
        'checkbox'       => ['boolean', 'bool'],
        'date'           => ['date'],
        'datetime-local' => ['datetime', 'timestamp'],
        'time'           => ['time'],
        'json'           => ['json', 'jsonb'],
    ];
    protected const SYSTEM_COLUMNS = ['id', 'created_at', 'updated_at', 'creater_id', 'updater_id', 'remember_token'];
    protected function isSystemColumn(string $columnName, ?string $pkField = null): bool
    {
        return in_array($columnName, self::SYSTEM_COLUMNS, true) || ($pkField !== null && $columnName === $pkField);
    }
    protected function inferBaseType(array $col): string
    {
        $typeDef = $col['type'] ?? '';
        if ($typeDef === 'tinyint(1)') return 'checkbox';
        $cleanType = strtok($typeDef, '() ');
        foreach (self::TYPE_MAPPING as $type => $rawTypes) {
            if (in_array($cleanType, $rawTypes, true)) return $type;
        }
        return 'text';
    }
    protected function inferLabel(string $columnName, ?string $comment = null, bool $isPrimaryId = false): string
    {
        if ($isPrimaryId) return 'ID';
        if ($comment) {
            return str_contains($comment, 'label:')
                ? trim(substr($comment, strpos($comment, 'label:') + 6))
                : str_replace('_', ' ', $comment);
        }
        return Str::upper(str_replace('_', ' ', $columnName));
    }
    protected function buildBaseColumnDefinition(array $col, string $tableName): array
    {
        $name = $col['name'] ?? '';
        $isPrimaryId = ($name === 'id' || $name === "id_{$tableName}");
        $isForeignKey = (!$isPrimaryId && str_starts_with($name, 'id_'));
        return [
            'name'        => $name,
            'label'       => $this->inferLabel($name, $col['comment'] ?? null, $isPrimaryId),
            'type'        => $this->inferBaseType($col),
            'is_primary'  => $isPrimaryId,
            'is_foreign'  => $isForeignKey,
            'is_nullable' => $col['nullable'] ?? true,
        ];
    }
}