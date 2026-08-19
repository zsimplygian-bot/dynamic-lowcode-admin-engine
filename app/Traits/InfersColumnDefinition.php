<?php

namespace App\Traits;

use Illuminate\Support\Str;

trait InfersColumnDefinition
{
    private const TYPE_MAPPING = [
        'int' => 'number', 'integer' => 'number', 'bigint' => 'number', 'smallint' => 'number',
        'tinyint' => 'number', 'mediumint' => 'number', 'int4' => 'number', 'int8' => 'number',
        'decimal' => 'number', 'numeric' => 'number', 'float' => 'number', 'double' => 'number',
        'real' => 'number', 'text' => 'textarea', 'mediumtext' => 'textarea', 'longtext' => 'textarea',
        'boolean' => 'checkbox', 'bool' => 'checkbox', 'date' => 'date', 'datetime' => 'datetime-local',
        'timestamp' => 'datetime-local', 'time' => 'time',
    ];

    private const FILE_KEYWORDS  = ['archivo', 'imagen', 'icon', 'logo', 'avatar', 'photo', 'foto'];
    private const EMAIL_KEYWORDS = ['email', 'correo'];
    private const PHONE_KEYWORDS = ['telefono', 'celular', 'phone'];
    private const PASS_KEYWORDS  = ['password', 'clave'];

    protected function inferType(string $columnName, mixed $col, bool $isForeignKey = false): string
    {
        if ($isForeignKey) return 'select';

        if (Str::contains($columnName, self::FILE_KEYWORDS)) return 'image';

        $fullType = strtolower(is_array($col) ? ($col['type'] ?? '') : ($col->type ?? ''));
        $rawType  = strtolower(is_array($col) ? ($col['type_name'] ?? $fullType) : ($col->type_name ?? $fullType));

        $cleanType = strtok($rawType, '() ');
        if ($cleanType === 'tinyint' && str_contains($fullType, 'tinyint(1)')) {
            return 'checkbox';
        }

        $type = self::TYPE_MAPPING[$cleanType] ?? 'text';

        if ($type === 'text' || $type === 'textarea') {
            if (Str::contains($columnName, self::EMAIL_KEYWORDS)) return 'email';
            if (Str::contains($columnName, self::PHONE_KEYWORDS)) return 'tel';
            if (Str::contains($columnName, self::PASS_KEYWORDS)) return 'password';
        }

        return $type;
    }

    protected function inferLabel(string $columnName, ?string $comment, bool $isPrimaryId): string
    {
        if ($comment !== null && $comment !== '') {
            if (str_contains($comment, 'label:') && preg_match("/label\s*:\s*['\"]([^'\"]+)['\"]/i", $comment, $match)) {
                return Str::upper($match[1]);
            }
            return Str::upper(str_replace('_', ' ', $comment));
        }

        if ($columnName === 'created_at') return 'FECHA CREACIÓN';
        if ($isPrimaryId) return 'ID';

        return Str::upper(str_replace('_', ' ', $columnName));
    }

    protected function buildBaseColumnDefinition(mixed $col, string $tableName): array
    {
        $isArr   = is_array($col);
        $name    = $isArr ? ($col['name'] ?? '') : ($col->name ?? (string) $col);
        $comment = $isArr ? ($col['comment'] ?? null) : ($col->comment ?? null);

        $isPrimaryId  = $name === 'id' || $name === "id_{$tableName}";
        $isForeignKey = !$isPrimaryId && (str_starts_with($name, 'id_') || str_ends_with($name, '_id'));

        return [
            'name'        => $name,
            'label'       => $this->inferLabel($name, $comment, $isPrimaryId),
            'type'        => $this->inferType($name, $col, $isForeignKey),
            'is_primary'  => $isPrimaryId,
            'is_foreign'  => $isForeignKey,
            'is_nullable' => $isArr ? ($col['nullable'] ?? true) : ($col->nullable ?? true),
        ];
    }
}