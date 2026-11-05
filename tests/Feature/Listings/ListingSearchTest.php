<?php

use App\Models\Listing;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('the search finds listings by street, neighborhood or city', function (string $q) {
    $match = Listing::factory()->create([
        'street' => 'Rua das Flores',
        'neighborhood' => 'Jardim Botânico',
        'city' => 'Curitiba',
    ]);
    Listing::factory()->create(['street' => 'Avenida Brasil', 'neighborhood' => 'Centro', 'city' => 'Santos']);

    $this->actingAs($this->user)
        ->get(route('listings.search', ['q' => $q]))
        ->assertInertia(fn ($page) => $page
            ->where('listings.total', 1)
            ->where('listings.data.0.id', $match->id));
})->with(['das Flores', 'Botânico', 'Curitiba']);

test('the search shows 12 listings per page', function () {
    Listing::factory()->count(15)->create();

    $this->actingAs($this->user)
        ->get(route('listings.search'))
        ->assertInertia(fn ($page) => $page
            ->where('listings.total', 15)
            ->has('listings.data', 12));

    $this->actingAs($this->user)
        ->get(route('listings.search', ['page' => 2]))
        ->assertInertia(fn ($page) => $page->has('listings.data', 3));
});

test('the search shows the newest listings first', function () {
    $old = Listing::factory()->create(['created_at' => now()->subDays(3)]);
    $new = Listing::factory()->create(['created_at' => now()]);

    $this->actingAs($this->user)
        ->get(route('listings.search'))
        ->assertInertia(fn ($page) => $page
            ->where('listings.data.0.id', $new->id)
            ->where('listings.data.1.id', $old->id));
});

test('search results do not show private listing data', function () {
    Listing::factory()->create();

    $this->actingAs($this->user)
        ->get(route('listings.search'))
        ->assertInertia(fn ($page) => $page
            ->missing('listings.data.0.user_id')
            ->missing('listings.data.0.cep')
            ->missing('listings.data.0.documents'));
});

test('an empty search shows no results', function () {
    Listing::factory()->pending()->count(2)->create();

    $this->actingAs($this->user)
        ->get(route('listings.search', ['q' => 'Cidade que não existe']))
        ->assertInertia(fn ($page) => $page->where('listings.total', 0));
});
