<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Create a new account and log the user in.
     */
    public function store(RegisterRequest $request): RedirectResponse
    {
        $email = $request->string('email')->toString();
        $isBroker = $request->boolean('is_broker');

        $user = User::create([
            'name' => Str::before($email, '@'),
            'email' => $email,
            'is_broker' => $isBroker,
            'creci' => $isBroker ? $request->string('creci')->trim()->toString() : null,
            'password' => $request->string('password')->toString(),
        ]);

        Auth::login($user);

        $request->session()->regenerate();

        return redirect()->route('home');
    }
}
