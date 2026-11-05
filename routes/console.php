<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('user:admin {email} {--remove : Remove the administrator access}', function (string $email) {
    $user = User::where('email', $email)->first();

    if (! $user) {
        $this->error("Nenhum usuário encontrado com o e-mail {$email}.");

        return 1;
    }

    $user->is_admin = ! $this->option('remove');
    $user->save();

    $this->info($user->is_admin
        ? "{$email} agora é administrador."
        : "{$email} não é mais administrador.");

    return 0;
})->purpose('Give (or remove) administrator access to a user');
