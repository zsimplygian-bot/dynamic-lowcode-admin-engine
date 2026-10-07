<?php

use App\Http\Controllers\Settings\AppearanceController;
use App\Http\Controllers\Settings\CacheController;
use App\Http\Controllers\Settings\DatabaseIEController;
use App\Http\Controllers\Settings\PermissionController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\RoleController;
use App\Http\Controllers\Settings\RolePermissionController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\TableController;
use App\Http\Controllers\Settings\TableFieldController;
use App\Http\Controllers\Settings\UserPermissionController;
use App\Http\Controllers\Settings\UserRoleController;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('settings')->group(function () {
    // Importación y Exportación
    Route::get('/table/export', [DatabaseIEController::class, 'export'])->name('tables.export');
    Route::post('/table/import', [DatabaseIEController::class, 'import'])->name('tables.import');

    // Gestión de tablas
    Route::resource('table', TableController::class)->except(['create', 'edit', 'show'])->names('tables');

    // Campos de tabla
    Route::get('/table/{table}', [TableFieldController::class, 'show'])->name('tables.fields.show');
    Route::post('/table/{table}/field', [TableFieldController::class, 'store'])->name('tables.fields.store');
    Route::put('/table/{table}/field/{field}', [TableFieldController::class, 'update'])->name('tables.fields.update');
    Route::delete('/table/{table}/field/{field}', [TableFieldController::class, 'destroy'])->name('tables.fields.destroy');

    // Permisos y Roles
    Route::resource('role', RoleController::class)->except(['create', 'edit'])->names('role');
    Route::resource('user-role', UserRoleController::class)->except(['create', 'edit'])->names('user-role');
    Route::resource('permission', PermissionController::class)->except(['create', 'edit'])->names('permission');
    Route::resource('role-permission', RolePermissionController::class)->except(['create', 'edit'])->names('role-permission');
    Route::resource('user-permission', UserPermissionController::class)->except(['create', 'edit'])->names('user-permission');

    // Security
    Route::get('security', [SecurityController::class, 'edit'])->middleware(RequirePassword::class)->name('security.edit');
    Route::put('password', [SecurityController::class, 'update'])->middleware('throttle:6,1')->name('user-password.update');
});

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    // Profile
    Route::get('settings/profile', [ProfileController::class, 'index'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Appearance & Cache
    Route::get('settings/appearance', [AppearanceController::class, 'index'])->name('appearance.index');
    Route::post('settings/appearance', [AppearanceController::class, 'update'])->name('appearance.update');
    Route::singleton('settings/cache', CacheController::class)->destroyable();
});