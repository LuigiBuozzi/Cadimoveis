<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\ListingController;
use App\Models\Listing;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::inertia('/', 'home')->name('home');

    Route::get('pesquisar', [ListingController::class, 'search'])->name('listings.search');
    Route::get('anunciar', [ListingController::class, 'create'])->name('listings.create');
    Route::get('anuncios', [ListingController::class, 'index'])->name('listings.index');
    Route::post('anuncios', [ListingController::class, 'store'])->name('listings.store');
    Route::get('aprovacoes', [ListingController::class, 'review'])
        ->middleware('can:review,'.Listing::class)
        ->name('listings.review');

    Route::get('imoveis/{listing}', [ListingController::class, 'show'])
        ->middleware('can:view,listing')
        ->name('listings.show');
    Route::post('imoveis/{listing}/aprovar', [ListingController::class, 'approve'])
        ->middleware('can:approve,listing')
        ->name('listings.approve');

    Route::middleware('can:update,listing')->group(function () {
        Route::get('imoveis/{listing}/editar', [ListingController::class, 'edit'])->name('listings.edit');
        Route::put('imoveis/{listing}', [ListingController::class, 'update'])->name('listings.update');
        Route::get('imoveis/{listing}/documentos/{document}', [ListingController::class, 'downloadDocument'])
            ->scopeBindings()
            ->name('listings.documents.download');
    });

    Route::delete('imoveis/{listing}', [ListingController::class, 'destroy'])
        ->middleware('can:delete,listing')
        ->name('listings.destroy');
});

Route::middleware('guest')->group(function () {
    Route::get('login', [LoginController::class, 'create'])->name('login');
    Route::post('login', [LoginController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('login.store');

    Route::get('register', [RegisterController::class, 'create'])->name('register');
    Route::post('register', [RegisterController::class, 'store'])->name('register.store');
});

Route::post('logout', [LoginController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');
