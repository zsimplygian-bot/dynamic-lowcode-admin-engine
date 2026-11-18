<?php
namespace App\Http\Controllers;
use App\Services\Database;
use Inertia\Inertia;
class WelcomeController extends Controller
{
    public function __invoke()
    {
        return Inertia::render('welcome', [
            'database' => [
                'current'   => session('active_db'),
                'available' => app(Database::class)->all(),
            ],
        ]);
    }
}