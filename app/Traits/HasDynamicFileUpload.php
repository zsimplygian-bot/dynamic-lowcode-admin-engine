<?php

namespace App\Traits;

use Illuminate\Http\Request;

trait HasDynamicFileUpload
{
    use HasImageProcessing;

    protected function handleFilesUpload(Request $request, string $tabla, array $data, object|array|null $existingRecord = null): array
    {
        // 1. Manejo de eliminación explícita (_remove_{key})
        if ($existingRecord) {
            $recordData = is_object($existingRecord) ? $existingRecord : (object) $existingRecord;

            foreach ($request->all() as $paramKey => $paramValue) {
                if (str_starts_with($paramKey, '_remove_') && ($paramValue === '1' || $paramValue === 1 || $paramValue === true || $paramValue === 'true')) {
                    $fileKey = str_replace('_remove_', '', $paramKey);
                    $oldValue = is_object($recordData) ? ($recordData->{$fileKey} ?? null) : ($recordData[$fileKey] ?? null);

                    if (!empty($oldValue)) {
                        $this->deleteFileAndThumb($oldValue);
                    }
                    $data[$fileKey] = null;
                }
            }
        }

        // 2. Obtener archivos válidos
        $files = array_filter($request->allFiles(), fn($f) => $f->isValid());

        // 3. Procesar y guardar nuevos archivos
        foreach ($files as $key => $file) {
            $oldValue = is_object($existingRecord) ? ($existingRecord->{$key} ?? null) : ($existingRecord[$key] ?? null);
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