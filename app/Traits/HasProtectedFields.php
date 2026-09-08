<?php
namespace App\Traits;

trait HasProtectedFields
{
    use HasProtectedTables;

    protected array $baseProtectedFields = ['creater_id', 'updater_id', 'created_at', 'updated_at'];

    protected function isProtectedField(string $table, string $field): bool
    {
        $field = trim($field);
        $protected = array_merge($this->baseProtectedFields, ["id_{$table}", $table]);

        return in_array($field, $protected, true);
    }
}