<?php
use App\Http\Controllers\Settings\{
    AppearanceController, CacheController, DatabaseIEController, PermissionController, ProfileController, RoleController, 
    RolePermissionController, SecurityController, TableController, TableFieldController, UserPermissionController, UserRoleController
};
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;
Route::prefix('settings')->middleware('auth')->group(function () {
    Route::redirect('/', '/settings/profile');
    Route::apiSingleton('appearance', AppearanceController::class);
    Route::apiSingleton('profile', ProfileController::class)->destroyable();
    Route::singleton('cache', CacheController::class)->destroyable();
    // Rutas con verificación de correo
    Route::middleware('verified')->group(function () {
        Route::get('table/export', [DatabaseIEController::class, 'export'])->name('tables.export');
        Route::post('table/import', [DatabaseIEController::class, 'import'])->name('tables.import');
        Route::resource('table', TableController::class)->except(['create', 'edit', 'show'])->names('tables');
        Route::get('table/{table}', [TableFieldController::class, 'show'])->name('tables.fields.show');
        Route::resource('table.field', TableFieldController::class)->only(['store', 'update', 'destroy'])->names('tables.fields');
        Route::apiResources([
            'role' => RoleController::class,
            'user-role' => UserRoleController::class,
            'permission' => PermissionController::class,
            'role-permission' => RolePermissionController::class,
            'user-permission' => UserPermissionController::class,
        ]);
        Route::get('security', [SecurityController::class, 'edit'])->middleware(RequirePassword::class)->name('security.edit');
        Route::put('password', [SecurityController::class, 'update'])->middleware('throttle:6,1')->name('user-password.update');
    });
}); 