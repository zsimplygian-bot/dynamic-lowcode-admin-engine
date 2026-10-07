<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Traits\HasNotify;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;

class CacheController extends Controller
{
    use HasNotify;

    public function show() { return Inertia::render('settings/cache'); }

    public function destroy(Request $request)
    {
        Artisan::call('optimize:clear');
        return $this->notify('Global system cache cleared successfully.');
    }
}