<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('home'))->assertRedirect(route('login'));
});

test('authenticated users can visit the home page', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('home'))
        ->assertOk();
});

test('authenticated users can visit the listing pages', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('listings.create'))->assertOk();
    $this->actingAs($user)->get(route('listings.index'))->assertOk();
    $this->actingAs($user)->get(route('listings.search', ['q' => 'casa']))->assertOk();
});

test('guests cannot visit the listing pages', function () {
    $this->get(route('listings.create'))->assertRedirect(route('login'));
    $this->get(route('listings.index'))->assertRedirect(route('login'));
    $this->get(route('listings.search'))->assertRedirect(route('login'));
});
