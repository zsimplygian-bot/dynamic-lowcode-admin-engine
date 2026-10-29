<?php

use App\Http\Controllers\{
    CitaController, DashboardController, DynamicCrudController, 
    DynamicFormSchemaController, DynamicTableController, HistoriaController, 
    LocaleController, LookupController, NavigationController
};
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/locale', LocaleController::class)->name('locale');

    // Rutas dinámicas genéricas
    Route::get('/schema/{table}/fields', [DynamicFormSchemaController::class, 'fields']);
    Route::get('/schema/{table}/columns', [DynamicTableController::class, 'columns']);
    Route::get('/historia/{id}/pdf', [HistoriaController::class, 'pdf'])->name('historia.pdf');

    Route::controller(DynamicTableController::class)->prefix('table')->name('table.')->group(function () {
        Route::get('/{table}', 'show')->name('show');
        Route::get('/{table}/data', 'data')->name('data');
        Route::get('/{table}/export', 'export')->name('export');
        Route::get('/{table}/record/{id}', 'findRecord')->name('record');
    });

    Route::prefix('crud/{table}')->name('crud.')->group(function () {
    Route::post('/bulk-delete', [DynamicCrudController::class, 'destroyBulk'])->name('bulkDelete');
    Route::post('/{id}/restore', [DynamicCrudController::class, 'restore'])->name('restore');
    Route::apiResource('/', DynamicCrudController::class)->parameters(['' => 'id']);
});

    Route::prefix('api')->group(function () {
        Route::get('/navigation', NavigationController::class)->name('navigation');
        Route::get('/lookups/{campo}', [LookupController::class, 'index'])->name('lookups');
        Route::get('/dashboard/metrics/{table}', [DashboardController::class, 'metrics'])->name('dashboard.metrics');
        Route::get('/historia/{id}/actividades', [HistoriaController::class, 'actividades'])->name('historia.actividades');

        Route::controller(CitaController::class)->name('citas.')->group(function () {
            Route::get('/citas/proximas', 'proximas')->name('proximas');
            Route::post('/cita/{id}/estado/{estadoId}', 'cambiarEstado')->name('estado');
        });
    });
});

require __DIR__.'/settings.php';