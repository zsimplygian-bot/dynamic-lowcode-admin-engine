<?php
namespace App\Traits;
use Illuminate\Support\Str;
trait HasColumnLabel
{
    use HasComment;
    protected function inferLabel(string $column, ?string $comment = null): string
    {
        $commentLabel = $this->parseComment($comment, 'label');
        if ($commentLabel && is_string($commentLabel)) {
            return $commentLabel;
        }
        $clean = str_ends_with($column, '_id') ? substr($column, 0, -3) : $column;
        return Str::upper(str_replace('_', ' ', $clean));
    }
}