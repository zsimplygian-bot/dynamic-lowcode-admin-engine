<?php
namespace App\Traits;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
trait HasImageProcessing
{
    protected function processAndStoreFile(UploadedFile $file, string $directory, ?string $oldFilePath = null): string
    {
        $disk = Storage::disk('public');
        if ($oldFilePath) {
            $this->deleteFileAndThumb($oldFilePath);
        }
        $baseName = time() . '_' . Str::random(5);
        $extension = strtolower($file->guessExtension() ?? $file->getClientOriginalExtension() ?? 'bin');
        $mime = $file->getMimeType() ?? '';
        $isRasterImage = str_starts_with($mime, 'image/') && $mime !== 'image/svg+xml';
        if ($isRasterImage) {
            $manager = ImageManager::usingDriver(GdDriver::class);
            $sourceImage = $manager->decodePath($file->getRealPath());
            // HD (Max 1280x720)
            $mainImage = (clone $sourceImage)->scaleDown(width: 1280, height: 720);
            $mainEncoded = $mainImage->encodeUsingFileExtension($extension, quality: 85);
            $mainPath = "{$directory}/{$baseName}.{$extension}";
            $disk->put($mainPath, $mainEncoded->toString());
            // Thumbnail (Max 89x50)
            $thumbImage = (clone $sourceImage)->scaleDown(width: 89, height: 50);
            $thumbEncoded = $thumbImage->encodeUsingFileExtension($extension, quality: 80);
            $thumbPath = "{$directory}/{$baseName}_thumb.{$extension}";
            $disk->put($thumbPath, $thumbEncoded->toString());
            unset($sourceImage, $mainImage, $thumbImage, $mainEncoded, $thumbEncoded);
            return $mainPath;
        }
        return $file->storeAs($directory, "{$baseName}.{$extension}", 'public');
    }
    protected function deleteFileAndThumb(?string $fileUrlOrPath): void
    {
        if (empty($fileUrlOrPath)) return;
        $disk = Storage::disk('public');
        $parsedPath = parse_url($fileUrlOrPath, PHP_URL_PATH);
        $path = preg_replace('/^\/?storage\//', '', $parsedPath ?? $fileUrlOrPath);
        if ($disk->exists($path)) {
            $disk->delete($path);
        }
        $thumbPath = preg_replace('/(\.[a-zA-Z0-9]+)$/', '_thumb$1', $path);
        if ($disk->exists($thumbPath)) {
            $disk->delete($thumbPath);
        }
    }
}