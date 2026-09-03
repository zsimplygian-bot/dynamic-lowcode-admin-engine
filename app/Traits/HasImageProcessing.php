<?php
namespace App\Traits;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
trait HasImageProcessing
{
    protected function processAndStoreFile(UploadedFile $file, string $directory): string
    {
        $disk = Storage::disk('public');
        $baseName = time() . '_' . Str::random(5);
        $extension = strtolower($file->guessExtension() ?? $file->getClientOriginalExtension() ?? 'jpg');
        $manager = ImageManager::usingDriver(GdDriver::class);
        $sourceImage = $manager->decodePath($file->getRealPath());
        // 1. Imagen Principal HD
        $mainImage = (clone $sourceImage)->scaleDown(width: 1280, height: 720);
        $disk->put("{$directory}/{$baseName}.{$extension}", $mainImage->encodeUsingFileExtension($extension, quality: 85)->toString());
        // 2. Thumbnail
        $thumbImage = (clone $sourceImage)->scaleDown(width: 89, height: 50);
        $disk->put("{$directory}/{$baseName}_thumb.{$extension}", $thumbImage->encodeUsingFileExtension($extension, quality: 80)->toString());
        return "{$directory}/{$baseName}.{$extension}";
    }
    protected function deleteFileAndThumb(?string $path): void
    {
        if (empty($path)) return;
        // Limpia el prefijo /storage/
        $relative = str_replace('/storage/', '', $path);
        // Inserta "_thumb." reemplazando el último "." directamente
        $thumb = preg_replace('/\.([^.]+)$/', '_thumb.$1', $relative);
        Storage::disk('public')->delete([$relative, $thumb]);
    }
}