<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LocaleController extends Controller
{
    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'locale' => 'required|string|in:es,en,ja',
        ]);

        session(['locale' => $validated['locale']]);

        return back();
    }
}