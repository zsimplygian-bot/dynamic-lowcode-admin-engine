<?php
namespace App\Services;
use Illuminate\Support\Str;
class ColumnMetadata
{
    private const TYPE_MAPPING = [
        'number'         => ['int', 'integer', 'bigint', 'smallint', 'tinyint', 'mediumint', 'decimal', 'numeric', 'float', 'double'],
        'textarea'       => ['text', 'mediumtext', 'longtext'],
        'checkbox'       => ['boolean', 'bool'],
        'date'           => ['date'],
        'datetime-local' => ['datetime', 'timestamp'],
        'time'           => ['time'],
        'json'           => ['json', 'jsonb'],
    ];
    private const FILE_KEYWORDS  = ['imagen', 'icon', 'logo', 'avatar', 'photo', 'foto', 'documento', 'comprobante', 'pdf', 'file', 'archivo'];
    private const EMAIL_KEYWORDS = ['email', 'correo'];
    private const PHONE_KEYWORDS = ['telefono', 'celular', 'phone', 'tel'];
    private const PASS_KEYWORDS  = ['password', 'contrasena', 'contraseña', 'clave'];
    public static function parseEnum(string $type): array
    {
        if (!str_starts_with($type, 'enum(')) return [];
        preg_match_all("/'([^']+)'/", $type, $m);
        return array_map(fn ($v) => ['id' => $v, 'label' => Str::title(str_replace('_', ' ', $v))], $m[1] ?? []);
    }
    public static function inputType(string $name, string $rawType): string
    {
        if (str_ends_with($name, '_id') || str_starts_with($rawType, 'enum(')) return 'select';
        if (Str::contains($name, self::FILE_KEYWORDS)) return 'file';
        if ($rawType === 'tinyint(1)') return 'checkbox';
        $clean = strtok($rawType, '() ');
        foreach (self::TYPE_MAPPING as $type => $raws) {
            if (in_array($clean, $raws, true)) return $type;
        }
        if (Str::contains($name, self::EMAIL_KEYWORDS)) return 'email';
        if (Str::contains($name, self::PHONE_KEYWORDS)) return 'tel';
        if (Str::contains($name, self::PASS_KEYWORDS)) return 'password';
        return 'text';
    }
}