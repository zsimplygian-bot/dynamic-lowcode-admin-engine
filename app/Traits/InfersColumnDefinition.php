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

    protected const SYSTEM_COLUMNS = ['id', 'created_at', 'updated_at', 'creater_id', 'creator_id', 'updater_id'];

    protected const IMAGE_KEYWORDS = ['imagen', 'icon', 'logo', 'avatar', 'photo', 'foto'];
    protected const FILE_KEYWORDS  = ['documento', 'comprobante', 'pdf', 'file', 'anexo', 'archivo'];
    protected const EMAIL_KEYWORDS = ['email', 'correo'];
    protected const PHONE_KEYWORDS = ['telefono', 'celular', 'phone', 'tel'];
    protected const PASS_KEYWORDS  = ['password', 'contrasena', 'contraseña', 'clave_acceso', 'clave'];

    protected function isSystemColumn(string $columnName, ?string $pkField = null): bool
    {
        return in_array($columnName, self::SYSTEM_COLUMNS, true) || ($pkField !== null && $columnName === $pkField);
    }

    protected function parseEnumOptions(string $typeDef): array
    {
        if (!str_starts_with($typeDef, 'enum(')) return [];
        preg_match_all("/'([^']+)'/", $typeDef, $matches);
        return array_map(fn($val) => ['id' => $val, 'label' => Str::title(str_replace('_', ' ', $val))], $matches[1] ?? []);
    }

    protected function inferBaseType(array $col, string $tableName): string
    {
        $name = $col['name'] ?? '';
        $isPrimaryId = ($name === 'id' || $name === "id_{$tableName}");

        if (!$isPrimaryId && str_starts_with($name, 'id_')) {
            return 'select';
        }

        $typeDef = $col['type'] ?? '';
        if ($typeDef === 'tinyint(1)') return 'checkbox';

        $cleanType = strtok($typeDef, '() ');
        foreach (self::TYPE_MAPPING as $type => $rawTypes) {
            if (in_array($cleanType, $rawTypes, true)) return $type;
        }

        return 'text';
    }

    protected function resolveFormInputType(string $name, string $baseType, bool $isForeign): string
    {
        if ($isForeign) return 'select';
        if (Str::contains($name, array_merge(self::IMAGE_KEYWORDS, self::FILE_KEYWORDS))) return 'file';
        if ($baseType === 'text' || $baseType === 'textarea') {
            if (Str::contains($name, self::EMAIL_KEYWORDS)) return 'email';
            if (Str::contains($name, self::PHONE_KEYWORDS)) return 'tel';
            if (Str::contains($name, self::PASS_KEYWORDS)) return 'password';
        }
        return $baseType;
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
        $baseType = $this->inferBaseType($col, $tableName);

        return [
            'name'        => $name,
            'label'       => $this->inferLabel($name, $col['comment'] ?? null, $isPrimaryId),
            'base_type'   => $baseType,
            'ui_type'     => $this->resolveFormInputType($name, $baseType, $isForeignKey),
            'is_primary'  => $isPrimaryId,
            'is_foreign'  => $isForeignKey,
            'is_nullable' => $col['nullable'] ?? true,
            'db_type'     => $col['type'] ?? '',
            'default'     => $col['default'] ?? null,
            'options'     => $this->parseEnumOptions($col['type'] ?? ''),
        ];
    }
}