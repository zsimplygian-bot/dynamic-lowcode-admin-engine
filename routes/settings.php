<?php

use App\Http\Controllers\Settings\AppearanceController;
use App\Http\Controllers\Settings\CacheController;
use App\Http\Controllers\Settings\DatabaseIEController;
use App\Http\Controllers\Settings\NavigationController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\TableController;
use App\Http\Controllers\Settings\TableFieldController;
use App\Http\Controllers\Settings\RoleController;
use App\Http\Controllers\Settings\UserRoleController;
use App\Http\Controllers\Settings\PermissionController;
use App\Http\Controllers\Settings\RolePermissionController;
use App\Http\Controllers\Settings\UserPermissionController;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('settings')->group(function () {
    // Importación y Exportación (RUTAS ESTÁTICAS PRIMERO)
    Route::get('/table/export', [DatabaseIEController::class, 'export'])->name('tables.export');
    Route::post('/table/import', [DatabaseIEController::class, 'import'])->name('tables.import');

    // Gestión de tablas
    Route::resource('table', TableController::class)->except(['create', 'edit'])->names('tables');

    // Gestión de campos de tabla
    Route::post('/table/{table}/field', [TableFieldController::class, 'store'])->name('tables.fields.store');
    Route::put('/table/{table}/field/{field}', [TableFieldController::class, 'update'])->name('tables.fields.update');
    Route::delete('/table/{table}/field/{field}', [TableFieldController::class, 'destroy'])->name('tables.fields.destroy');

    // Gestión de roles
    Route::resource('role', RoleController::class)->except(['create', 'edit'])->names('role');
    Route::resource('user-role', UserRoleController::class)->except(['create', 'edit'])->names('user-role');
    Route::resource('permission', PermissionController::class)->except(['create', 'edit'])->names('permission');
    Route::resource('role-permission', RolePermissionController::class)->except(['create', 'edit'])->names('role-permission');
    Route::resource('user-permission', UserPermissionController::class)->except(['create', 'edit'])->names('user-permission');
});

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    // Profile
    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('settings/profile', [ProfileController::class, 'update'])->name('profile.update');

    // Appearance
    Route::get('settings/appearance', [AppearanceController::class, 'edit'])->name('appearance.edit');
    Route::post('settings/appearance', [AppearanceController::class, 'update'])->name('appearance.update');

    // Cache Global
    Route::get('settings/cache', [CacheController::class, 'edit'])->name('cache.edit');
    Route::delete('settings/cache', [CacheController::class, 'destroy'])->name('cache.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Navigation
    Route::inertia('settings/navigation', 'settings/navigation')->name('navigation.edit');

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