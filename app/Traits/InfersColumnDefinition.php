<?php
namespace App\Traits;
use Illuminate\Support\Str;
trait InfersColumnDefinition
{
    protected const TYPE_MAPPING = [
        'number'         => ['int', 'integer', 'bigint', 'smallint', 'tinyint', 'mediumint', 'int4', 'int8', 'decimal', 'numeric', 'float', 'double', 'real'],
        'textarea'       => ['text', 'mediumtext', 'longtext'],
        'checkbox'       => ['boolean', 'bool'],
        'select'         => ['enum'],
        'date'           => ['date'],
        'datetime-local' => ['datetime', 'timestamp'],
        'time'           => ['time'],
        'json'           => ['json', 'jsonb'],
    ];
    protected function parseEnumOptions(string $typeDef): array
    {
        if (!str_starts_with($typeDef, 'enum(')) return [];
        preg_match_all("/'([^']+)'/", $typeDef, $matches);
        return array_map(fn($val) => ['id' => $val, 'label' => Str::title(str_replace('_', ' ', $val))], $matches[1] ?? []);
    }
    protected function inferBaseType(array $col): string
    {
        $name = $col['name'] ?? '';
        if (str_ends_with($name, '_id')) return 'select';
        $typeDef = $col['type'] ?? '';
        if ($typeDef === 'tinyint(1)') return 'checkbox';
        $cleanType = strtok($typeDef, '() ');
        foreach (self::TYPE_MAPPING as $type => $rawTypes) {
            if (in_array($cleanType, $rawTypes, true)) return $type;
        }
        return 'text';
    }
    protected function inferLabel(string $columnName, ?string $comment = null): string
    {
        if ($comment) {
            return str_contains($comment, 'label:')
                ? trim(substr($comment, strpos($comment, 'label:') + 6))
                : str_replace('_', ' ', $comment);
        }
        return Str::upper(str_replace('_', ' ', $columnName));
    }
    protected function buildBaseColumnDefinition(array $col): array
    {
        $name = $col['name'] ?? '';
        $isPrimary = ($name === 'id');
        $isForeignKey = str_ends_with($name, '_id');
        $baseType = $this->inferBaseType($col);
        $options = $this->parseEnumOptions($col['type'] ?? '');
        return array_filter([
            'name'        => $name,
            'base_type'   => $baseType,
            'is_primary'  => $isPrimary ?: null,
            'is_foreign'  => $isForeignKey ?: null,
            'is_nullable' => ($col['nullable'] ?? true) ?: null,
            'db_type'     => $col['type'] ?? null,
            'default'     => $col['default'] ?? null,
            'comment'     => $col['comment'] ?? null,
            'options'     => !empty($options) ? $options : null,
        ], fn($val) => $val !== null);
    }
}