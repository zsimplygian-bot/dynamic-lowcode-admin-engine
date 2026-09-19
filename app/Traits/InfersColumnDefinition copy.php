<?php
namespace App\Traits;
use Illuminate\Support\Str;
trait InfersColumnDefinition
{
    protected const TYPE_MAPPING = [
        'number' => ['int', 'integer', 'bigint', 'smallint', 'tinyint', 'mediumint', 'int4', 'int8', 'decimal', 'numeric', 'float', 'double', 'real'],
        'textarea' => ['text', 'mediumtext', 'longtext'],
        'checkbox' => ['boolean', 'bool'],
        'date' => ['date'],
        'datetime-local' => ['datetime', 'timestamp'],
        'time' => ['time'],
        'json' => ['json', 'jsonb'],
    ];
    protected const SYSTEM_COLUMNS = ['id', 'created_at', 'updated_at', 'creater_id',  'updater_id',];
    protected const FILE_KEYWORDS = ['archivo', 'imagen', 'icon', 'logo', 'avatar', 'photo', 'foto', 'documento', 'comprobante'];
    protected const EMAIL_KEYWORDS = ['email', 'correo'];
    protected const PHONE_KEYWORDS = ['telefono', 'celular', 'phone', 'tel'];
    protected const PASS_KEYWORDS = ['password', 'contrasena', 'contraseña', 'clave_acceso', 'clave'];
    protected function isSystemColumn(string $columnName, ?string $pkField = null): bool
    {
        return in_array($columnName, self::SYSTEM_COLUMNS, true) || ($pkField !== null && $columnName === $pkField);
    }
    protected function inferType(string $columnName, array $col, bool $isForeignKey = false): string
    {
        if ($isForeignKey) return 'select';
        if (Str::contains($columnName, self::FILE_KEYWORDS)) return 'image';
        $typeDef = $col['type'] ?? '';
        if ($typeDef === 'tinyint(1)') return 'checkbox';
        $cleanType = strtok($typeDef, '() ');
        $type = 'text';
        foreach (self::TYPE_MAPPING as $htmlType => $rawTypes) {
            if (in_array($cleanType, $rawTypes, true)) {
                $type = $htmlType;
                break;
            }
        }
        if ($type === 'text' || $type === 'textarea') {
            if (Str::contains($columnName, self::EMAIL_KEYWORDS)) return 'email';
            if (Str::contains($columnName, self::PHONE_KEYWORDS)) return 'tel';
            if (Str::contains($columnName, self::PASS_KEYWORDS)) return 'password';
        }
        return $type;
    }
    protected function inferLabel(string $columnName, ?string $comment = null, bool $isPrimaryId = false): string
    {
        if ($isPrimaryId) return 'ID';
        if ($comment) return str_contains($comment, 'label:') ? trim(substr($comment, strpos($comment, 'label:') + 6)) : str_replace('_', ' ', $comment);
        return Str::upper(str_replace('_', ' ', $columnName));
    }
    protected function buildBaseColumnDefinition(array $col, string $tableName): array
    {
        $name = $col['name'] ?? '';
        $comment = $col['comment'] ?? null;
        $nullable = $col['nullable'] ?? true;
        $isPrimaryId = ($name === 'id' || $name === "id_{$tableName}");
        $isForeignKey = (!$isPrimaryId && str_starts_with($name, 'id_'));
        $type = $this->inferType($name, $col, $isForeignKey);
        $label = $this->inferLabel($name, $comment, $isPrimaryId);
        if ($type === 'checkbox') { $label .= '?'; }
        return [ 'name' => $name, 'label' => $label, 'type' => $type, 'is_primary' => $isPrimaryId, 'is_foreign' => $isForeignKey, 'is_nullable' => $nullable, ];
    }
}