<?php

use App\Models\User;

test('logging in is blocked after five failed attempts in a minute', function () {
    $user = User::factory()->create();

    foreach (range(1, 5) as $attempt) {
        $this->post(route('login.store'), ['email' => $user->email, 'password' => 'wrong-password']);
    }

    $this->post(route('login.store'), ['email' => $user->email, 'password' => 'password'])
        ->assertTooManyRequests();

    $this->assertGuest();
});

test('logged in users cannot open the login and register pages', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('login'))->assertRedirect(route('home'));
    $this->actingAs($user)->get(route('register'))->assertRedirect(route('home'));
});
