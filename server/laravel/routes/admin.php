<?php

/**
 * Admin Routes for Molochain CMS
 * 
 * Add these routes to your routes/web.php file, inside an auth middleware group.
 * 
 * Example:
 * 
 * // In routes/web.php, add this at the bottom:
 * require __DIR__.'/admin.php';
 * 
 * Or copy the content below directly into routes/web.php
 */

use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\HomeSectionsController;
use Illuminate\Support\Facades\Route;

// Define login route redirect for auth middleware (redirects to Filament login)
Route::get('/login', function () {
    return redirect()->route('filament.admin.auth.login');
})->name('login');

// Admin Routes (protected by auth middleware - now login route is defined above)
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    
    // Settings Management
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings', [SettingsController::class, 'store'])->name('settings.store');
    Route::put('/settings/{id}', [SettingsController::class, 'update'])->name('settings.update');
    Route::delete('/settings/{id}', [SettingsController::class, 'destroy'])->name('settings.destroy');

    // Menu Management
    Route::get('/menu', [MenuController::class, 'index'])->name('menu.index');
    Route::post('/menu', [MenuController::class, 'store'])->name('menu.store');
    Route::put('/menu/{id}', [MenuController::class, 'update'])->name('menu.update');
    Route::delete('/menu/{id}', [MenuController::class, 'destroy'])->name('menu.destroy');

    // Home Sections Management
    Route::get('/home-sections', [HomeSectionsController::class, 'index'])->name('home-sections.index');
    Route::get('/home-sections/{id}/edit', [HomeSectionsController::class, 'edit'])->name('home-sections.edit');
    Route::put('/home-sections/{id}', [HomeSectionsController::class, 'update'])->name('home-sections.update');
});
