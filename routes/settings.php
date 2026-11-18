<?php
use App\Http\Controllers\Settings\{
    AppearanceController, DatabaseController, PermissionController, ProfileController, 
    RoleController, RolePermissionController, SecurityController, SystemController, 
    TableController, TableFieldController, UserPermissionController, UserRoleController
};
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::prefix('settings')->middleware('auth')->group(function () {
    Route::redirect('/', '/settings/profile');
    Route::apiSingleton('appearance', AppearanceController::class);
    Route::apiSingleton('profile', ProfileController::class)->destroyable();
    Route::singleton('system', SystemController::class)->destroyable();
    Route::middleware('verified')->group(function () {
        Route::post('system/query', [SystemController::class, 'executeQuery'])->name('system.query');
        Route::controller(DatabaseController::class)->prefix('database')->name('database.')->group(function () {
            Route::post('/switch', 'switch')->name('switch');
            Route::get('/export', 'export')->name('export');
            Route::post('/import', 'import')->name('import');
            Route::delete('/purge', 'purge')->name('purge');
        });
        Route::resource('database', DatabaseController::class)->except(['create', 'edit', 'show'])->names('database');
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