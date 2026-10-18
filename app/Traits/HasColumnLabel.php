<?php
namespace App\Traits;
use Illuminate\Support\Str;
trait HasColumnLabel
{
    protected function inferLabel(string $column, ?string $comment = null): string
    {
        $clean = str_ends_with($column, '_id') ? substr($column, 0, -3) : $column;
        if ($comment) {
            if (str_contains($comment, 'label:')) { return trim(substr($comment, strpos($comment, 'label:') + 6)); }
            return str_replace('_', ' ', $comment);
        }
        return Str::upper(str_replace('_', ' ', $clean));
    }
}