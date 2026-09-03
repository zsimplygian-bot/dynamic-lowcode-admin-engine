<?php

namespace App\Traits;

use Illuminate\Http\Request;

trait HasDynamicFileUpload
{
    use HasImageProcessing;

    protected function handleFilesUpload(Request $request, string $tabla, array $data, object|array|null $existingRecord = null): array
    {
        $existingRecord = (object) ($existingRecord ?? []);

        // 1. Manejo de eliminación explícita (_remove_{key})
        if (!empty((array) $existingRecord)) {
            foreach ((array) $existingRecord as $key => $value) {
                if ($request->boolean("_remove_{$key}")) {
                    $this->deleteFileAndThumb($value);
                    $data[$key] = null;
                }
            }
        }

        // 2. Obtener archivos válidos
        $files = array_filter($request->allFiles(), fn($f) => $f->isValid());
        if (empty($files)) {
            return $data;
        }

        // 3. Procesar y guardar nuevos archivos
        foreach ($files as $key => $file) {
            $oldValue = $existingRecord->{$key} ?? null;
            if (!empty($oldValue)) {
                $this->deleteFileAndThumb($oldValue);
            }
            $savedPath = $this->processAndStoreFile($file, $tabla);
            $data[$key] = "/storage/{$savedPath}";
        }

        return $data;
    }

    protected function deleteRecordFiles(object|array $record): void
    {
        $attributes = is_object($record) ? (method_exists($record, 'getAttributes') ? $record->getAttributes() : (array) $record) : $record;

        foreach ($attributes as $value) {
            if (is_string($value) && str_contains($value, '/storage/')) {
                $this->deleteFileAndThumb($value);
            }
        }
    }
}