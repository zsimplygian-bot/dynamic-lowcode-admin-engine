<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
class LocaleController extends Controller
{
    public function __invoke(Request $request) { session(['locale' => $request->validate(['locale' => 'required|in:es,en,ja'])['locale']]); return back(); }
}