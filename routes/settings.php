<?php

use App\Http\Controllers\Settings\AppearanceController;
use App\Http\Controllers\Settings\DatabaseIEController;
use App\Http\Controllers\Settings\NavigationController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\TableController;
use App\Http\Controllers\Settings\TableFieldController;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('settings')->group(function () {
    // Importación y Exportación (RUTAS ESTÁTICAS PRIMERO)
    Route::get('/tables/export', [DatabaseIEController::class, 'export'])->name('tables.export');
    Route::post('/tables/import', [DatabaseIEController::class, 'import'])->name('tables.import');

    // Gestión de tablas
    Route::get('/tables', [TableController::class, 'index'])->name('tables.index');
    Route::post('/tables', [TableController::class, 'store'])->name('tables.store');
    Route::get('/tables/{table}', [TableController::class, 'show'])->name('tables.fields');
    Route::put('/tables/{table}', [TableController::class, 'update'])->name('tables.update');
    Route::delete('/tables/{table}', [TableController::class, 'destroy'])->name('tables.destroy');

    // CRUD de campos de una tabla
    Route::post('/tables/{table}/fields/reorder', [TableFieldController::class, 'reorder'])->name('tables.fields.reorder');
    Route::post('/tables/{table}/fields', [TableFieldController::class, 'store'])->name('tables.fields.store');
    Route::put('/tables/{table}/fields/{field}', [TableFieldController::class, 'update'])->name('tables.fields.update');
    Route::delete('/tables/{table}/fields/{field}', [TableFieldController::class, 'destroy'])->name('tables.fields.destroy');
});

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    // Profile
    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');

    // Appearance
    Route::get('settings/appearance', [AppearanceController::class, 'edit'])->name('appearance.edit');
    Route::patch('settings/appearance', [AppearanceController::class, 'update'])->name('appearance.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Navigation
    Route::get('settings/navigation', [NavigationController::class, 'edit'])->name('navigation.edit');
    Route::post('settings/navigation', [NavigationController::class, 'update'])->name('navigation.update');

    Route::post('settings/navigation/item', [NavigationController::class, 'store'])->name('navigation.store');
    Route::put('settings/navigation/item/{index}', [NavigationController::class, 'updateItem'])->name('navigation.update-item');
    Route::delete('settings/navigation/item/{index}', [NavigationController::class, 'destroy'])->name('navigation.destroy');

    // Profile destroy
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Security
    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');
});