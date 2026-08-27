<?php

use App\Http\Controllers\CitaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DynamicCrudController;
use App\Http\Controllers\DynamicFormSchemaController;
use App\Http\Controllers\DynamicTableController;
use App\Http\Controllers\HistoriaController;
use App\Http\Controllers\LookupController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/lookups/{campo}', [LookupController::class, 'index'])->name('lookups');
    Route::get('/schema/{table}/fields', [DynamicFormSchemaController::class, 'fields']);
    Route::get('/historia/{id}/pdf', [HistoriaController::class, 'pdf'])->name('historia.pdf');

    Route::controller(DynamicTableController::class)->prefix('tables')->name('tables.')->group(function () {
        Route::get('/{table}', 'show')->name('show');
        Route::get('/{table}/data', 'data')->name('data');
        Route::get('/{table}/record/{id}', 'findRecord')->name('record');
    });

    Route::controller(DynamicCrudController::class)->prefix('crud/{tabla}')->name('crud.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::get('/{id}', 'show')->name('show');
        Route::put('/{id}', 'update')->name('update');
        Route::delete('/{id}', 'destroy')->name('destroy');
    });

    Route::prefix('api')->group(function () {
        Route::get('/historia/{id}/actividades', [HistoriaController::class, 'actividades'])->name('historia.actividades');

        Route::controller(CitaController::class)->name('citas.')->group(function () {
            Route::get('/citas/proximas', 'proximas')->name('proximas');
            Route::post('/cita/{id}/atender', 'atender')->name('atender');
            Route::post('/cita/{id}/cancelar', 'cancelar')->name('cancelar');
        });
    });
});

require __DIR__.'/settings.php';