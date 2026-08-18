<?php
use App\Http\Controllers\DynamicFormSchemaController;
use App\Http\Controllers\DynamicCrudController;
use App\Http\Controllers\DynamicTableController;
use App\Http\Controllers\LookupController;
use Illuminate\Support\Facades\Route;
// Rutas públicas
Route::inertia('/', 'welcome')->name('home');
// Rutas protegidas
Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    // Lookups para selects dinámicos
    Route::get('/lookups/{campo}', [LookupController::class, 'index'])->name('lookups');
    // Vistas de tablas dinámicas
    Route::controller(DynamicTableController::class)->prefix('tables')->name('tables.')->group(function () {
        Route::get('/{table}', 'show')->name('show');
        Route::get('/{table}/data', 'data')->name('data');
        Route::get('/{table}/record/{id}', 'findRecord')->name('record');
    });
    Route::get('/schema/{table}/fields', [DynamicFormSchemaController::class, 'fields']);
    // Endpoints del CRUD dinámico
    Route::controller(DynamicCrudController::class)->prefix('crud/{tabla}')->name('crud.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::get('/{id}', 'show')->name('show');
        Route::put('/{id}', 'update')->name('update');
        Route::delete('/{id}', 'destroy')->name('destroy');
    });
});
require __DIR__.'/settings.php';