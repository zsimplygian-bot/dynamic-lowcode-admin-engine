<?php

namespace App\Traits;

use Illuminate\Support\Str;

trait InfersColumnDefinition
{
    protected const TYPE_MAPPING = [
        'int'        => 'number', 'integer'   => 'number', 'bigint'    => 'number', 'smallint'  => 'number',
        'tinyint'    => 'number', 'mediumint' => 'number', 'int4'      => 'number', 'int8'      => 'number',
        'decimal'    => 'number', 'numeric'   => 'number', 'float'     => 'number', 'double'    => 'number',
        'real'       => 'number', 'text'      => 'textarea', 'mediumtext' => 'textarea', 'longtext' => 'textarea',
        'boolean'    => 'checkbox', 'bool'    => 'checkbox', 'date'      => 'date', 'datetime'  => 'datetime-local',
        'timestamp'  => 'datetime-local', 'time' => 'time', 'json' => 'json', 'jsonb' => 'json',
    ];

    protected const SYSTEM_COLUMNS = [
        'id'              => true,
        'created_at'      => true,
        'updated_at'      => true,
        'deleted_at'      => true,
        'remember_token'  => true,
        'creater_id'      => true,
        'creator_id'      => true,
        'updater_id'      => true,
        'deleter_id'      => true,
        'user_id_created' => true,
    ];

    protected const FILE_KEYWORDS  = ['archivo', 'imagen', 'icon', 'logo', 'avatar', 'photo', 'foto', 'documento', 'comprobante'];
    protected const EMAIL_KEYWORDS = ['email', 'correo'];
    protected const PHONE_KEYWORDS = ['telefono', 'celular', 'phone', 'tel'];
    protected const PASS_KEYWORDS  = ['password', 'contrasena', 'contraseña', 'clave_acceso'];

    protected function isSystemColumn(string $columnName, ?string $pkField = null): bool
    {
        return isset(self::SYSTEM_COLUMNS[$columnName]) || ($pkField !== null && $columnName === $pkField);
    }

    protected function inferType(string $columnName, mixed $col, bool $isForeignKey = false): string
    {
        if ($isForeignKey) return 'select';

        $colLower = strtolower($columnName);

        if (Str::contains($colLower, self::FILE_KEYWORDS)) return 'image';

        $fullType = strtolower(is_array($col) ? ($col['type'] ?? '') : ($col->type ?? ''));
        $rawType  = strtolower(is_array($col) ? ($col['type_name'] ?? $fullType) : ($col->type_name ?? $fullType));
        $cleanType = strtok($rawType, '() ');

        if ($cleanType === 'tinyint' && str_contains($fullType, 'tinyint(1)')) {
            return 'checkbox';
        }

        $type = self::TYPE_MAPPING[$cleanType] ?? 'text';

        if ($type === 'text' || $type === 'textarea') {
            if (Str::contains($colLower, self::EMAIL_KEYWORDS)) return 'email';
            if (Str::contains($colLower, self::PHONE_KEYWORDS)) return 'tel';
            if (Str::contains($colLower, self::PASS_KEYWORDS) || $colLower === 'clave') return 'password';
        }

        return $type;
    }

    protected function inferLabel(string $columnName, ?string $comment = null, bool $isPrimaryId = false, bool $isForeignKey = false): string
    {
        if ($comment !== null && $comment !== '') {
            if (str_starts_with(strtolower($comment), 'label:')) {
                return trim(substr($comment, 6), " '\"\t\n\r\0\x0B");
            }
            return Str::upper(str_replace('_', ' ', $comment));
        }

        if ($isPrimaryId) return 'ID';
        if ($columnName === 'created_at') return 'FECHA CREACIÓN';
        if ($columnName === 'updated_at') return 'FECHA ACTUALIZACIÓN';

        if ($isForeignKey) {
            return Str::upper(str_replace('_', ' ', substr($columnName, 3)));
        }

        return Str::upper(str_replace('_', ' ', $columnName));
    }

    protected function buildBaseColumnDefinition(mixed $col, string $tableName): array
    {
        $isArr   = is_array($col);
        $name    = $isArr ? ($col['name'] ?? '') : ($col->name ?? (string) $col);
        $comment = $isArr ? ($col['comment'] ?? null) : ($col->comment ?? null);
        $isPrimaryId  = ($name === 'id' || $name === "id_{$tableName}");
        $isForeignKey = (!$isPrimaryId && str_starts_with($name, 'id_'));
        
        // 1. Primero inferimos el tipo y el label base
        $type  = $this->inferType($name, $col, $isForeignKey);
        $label = $this->inferLabel($name, $comment, $isPrimaryId, $isForeignKey);
        // 2. 👇 Si es booleano o checkbox, le agregamos el '?' al final (si no lo tiene ya)
        if ($type === 'checkbox' || $type === 'boolean') {
            $label = str_ends_with($label, '?') ? $label : "{$label}?";
            
            // O si prefieres estilo interrogativo completo (ej: "¿ACTIVO?"):
            // $label = (str_starts_with($label, '¿') ? '' : '¿') . trim($label, '?') . '?';
        }
        return [
            'name'        => $name,
            'label'       => $label,
            'type'        => $type,
            'is_primary'  => $isPrimaryId,
            'is_foreign'  => $isForeignKey,
            'is_nullable' => $isArr ? ($col['nullable'] ?? true) : ($col->nullable ?? true),
        ];
    }   
}