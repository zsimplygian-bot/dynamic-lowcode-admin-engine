<?php

use App\Http\Controllers\Settings\{
    AppearanceController, DatabaseIEController, PermissionController, ProfileController, 
    ProjectDatabaseController, RoleController, RolePermissionController, SecurityController, 
    SystemController, TableController, TableFieldController, UserPermissionController, UserRoleController
};
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::prefix('settings')->middleware('auth')->group(function () {
    Route::redirect('/', '/settings/profile');
    Route::apiSingleton('appearance', AppearanceController::class);
    Route::apiSingleton('profile', ProfileController::class)->destroyable();
    Route::singleton('system', SystemController::class)->destroyable();

    // Rutas con verificación de correo
    Route::middleware('verified')->group(function () {
        // Ejecución directa de consultas SQL
        Route::post('system/query', [SystemController::class, 'executeQuery'])->name('system.query');

        // Conmutador y creación de proyectos/bases de datos
        Route::post('database/switch', [ProjectDatabaseController::class, 'switch'])->name('database.switch');
        Route::post('database/create', [ProjectDatabaseController::class, 'store'])->name('database.store');

        // Gestión de tablas y backups
        Route::get('table/export', [DatabaseIEController::class, 'export'])->name('tables.export');
        Route::post('table/import', [DatabaseIEController::class, 'import'])->name('tables.import');
        Route::delete('table/purge', [TableController::class, 'purge'])->name('tables.purge');
        Route::resource('table', TableController::class)->except(['create', 'edit', 'show'])->names('tables');
        Route::get('table/{table}', [TableFieldController::class, 'show'])->name('tables.fields.show');
        Route::resource('table.field', TableFieldController::class)->only(['store', 'update', 'destroy'])->names('tables.fields');

        // Roles y Permisos
        Route::apiResources([
            'role' => RoleController::class,
            'user-role' => UserRoleController::class,
            'permission' => PermissionController::class,
            'role-permission' => RolePermissionController::class,
            'user-permission' => UserPermissionController::class,
        ]);

        // Seguridad
        Route::get('security', [SecurityController::class, 'edit'])->middleware(RequirePassword::class)->name('security.edit');
        Route::put('password', [SecurityController::class, 'update'])->middleware('throttle:6,1')->name('user-password.update');
    });
});