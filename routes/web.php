<?php

use App\Http\Controllers\CitaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DynamicActivityController;
use App\Http\Controllers\DynamicCrudController;
use App\Http\Controllers\DynamicFormSchemaController;
use App\Http\Controllers\DynamicTableController;
use App\Http\Controllers\HistoriaController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\LookupController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // 2. Ruta para cambiar de idioma
    
    Route::post('/locale', LocaleController::class)->name('locale');

    Route::get('/lookups/{campo}', [LookupController::class, 'index'])->name('lookups');
    
    Route::get('/schema/{table}/fields', [DynamicFormSchemaController::class, 'fields']);
    Route::get('/schema/{table}/columns', [DynamicTableController::class, 'columns']);
    Route::get('/historia/{id}/pdf', [HistoriaController::class, 'pdf'])->name('historia.pdf');

Route::controller(DynamicTableController::class)->prefix('table')->name('table.')->group(function () {
    Route::get('/{table}', 'show')->name('show');
    Route::get('/{table}/data', 'data')->name('data');
    Route::get('/{table}/export', 'export')->name('export');
    Route::get('/{table}/record/{id}', 'findRecord')->name('record');
});

    Route::controller(DynamicCrudController::class)->prefix('crud/{tabla}')->name('crud.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::get('/{id}', 'show')->name('show');
        Route::put('/{id}', 'update')->name('update');
        Route::delete('/{id}', 'destroy')->name('destroy');
    });

    Route::get('/tables/{table}/actividades', [DynamicActivityController::class, 'actividades'])->name('tables.actividades');

    Route::prefix('api')->group(function () {
        // Rutas específicas primero
        Route::get('/dashboard/metrics/{table}', [DashboardController::class, 'metrics'])->name('dashboard.metrics');
        
        // RUTA ESPECÍFICA DE HISTORIA (AGREGAR AQUÍ)
        Route::get('/historia/{id}/actividades', [HistoriaController::class, 'actividades'])->name('historia.actividades');

        Route::controller(CitaController::class)->name('citas.')->group(function () {
            Route::get('/citas/proximas', 'proximas')->name('proximas');
            Route::post('/cita/{id}/atender', 'atender')->name('atender');
            Route::post('/cita/{id}/cancelar', 'cancelar')->name('cancelar');
        });

        // Ruta genérica dinámica siempre al final
        Route::get('/{tableName}/{id}/actividades', [DynamicActivityController::class, 'actividades'])->name('dynamic.actividades');
    });
});

require __DIR__.'/settings.php';