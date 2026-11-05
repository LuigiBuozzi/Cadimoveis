<?php

use App\Models\User;

test('registration page can be rendered', function () {
    $this->get(route('register'))->assertOk();
});

test('new users can register', function () {
    $this->post(route('register.store'), [
        'email' => 'novo@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertRedirect(route('home'));

    $this->assertAuthenticated();
    expect(User::where('email', 'novo@example.com')->exists())->toBeTrue();
});

test('registration requires matching password confirmation', function () {
    $this->post(route('register.store'), [
        'email' => 'novo@example.com',
        'password' => 'password123',
        'password_confirmation' => 'different123',
    ])->assertSessionHasErrors('password');

    $this->assertGuest();
});

test('registration requires a unique e-mail', function () {
    $user = User::factory()->create();

    $this->post(route('register.store'), [
        'email' => $user->email,
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertSessionHasErrors('email');
});

test('brokers can register with their creci', function () {
    $this->post(route('register.store'), [
        'email' => 'corretor@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'is_broker' => '1',
        'creci' => '12345-F',
    ])->assertRedirect(route('home'));

    $user = User::where('email', 'corretor@example.com')->firstOrFail();

    expect($user->is_broker)->toBeTrue()
        ->and($user->creci)->toBe('12345-F');
});

test('brokers must provide their creci', function () {
    $this->post(route('register.store'), [
        'email' => 'corretor@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'is_broker' => '1',
    ])->assertSessionHasErrors('creci');

    $this->assertGuest();
});

test('creci is ignored for users who are not brokers', function () {
    $this->post(route('register.store'), [
        'email' => 'novo@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'creci' => '12345-F',
    ]);

    $user = User::where('email', 'novo@example.com')->firstOrFail();

    expect($user->is_broker)->toBeFalse()
        ->and($user->creci)->toBeNull();
});
