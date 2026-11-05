<?php

use App\Models\Listing;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    Storage::fake('local');

    $this->user = User::factory()->create();
});

test('the cep is saved with digits only and the state in upper case', function () {
    $this->actingAs($this->user)
        ->post(route('listings.store'), listingPayload(['cep' => '01.310-100', 'state' => 'sp']))
        ->assertSessionHasNoErrors();

    expect(Listing::sole())
        ->cep->toBe('01310100')
        ->state->toBe('SP');
});

test('invalid listing data is rejected', function (array $data, string $field) {
    $this->actingAs($this->user)
        ->post(route('listings.store'), listingPayload($data))
        ->assertSessionHasErrors($field);

    expect(Listing::count())->toBe(0);
})->with([
    'cep with 7 digits' => [['cep' => '0131010'], 'cep'],
    'cep with letters' => [['cep' => 'abcdefgh'], 'cep'],
    'unknown state' => [['state' => 'XX'], 'state'],
    'unknown property type' => [['type' => 'castelo'], 'type'],
    'price with cents' => [['price' => '2500.50'], 'price'],
    'zero price' => [['price' => '0'], 'price'],
    'missing street' => [['street' => ''], 'street'],
    'number too long' => [['number' => '12345678901'], 'number'],
    'negative room count' => [['bedrooms' => -1], 'bedrooms'],
    'room count above 99' => [['bathrooms' => 100], 'bathrooms'],
    'unknown photo room' => [['photo_rooms' => ['garagem', 'sala-de-estar']], 'photo_rooms.0'],
    'photo that is not an image' => [['photos' => [UploadedFile::fake()->create('foto.pdf', 10, 'application/pdf')], 'featured_photo' => 0], 'photos.0'],
]);

test('validation errors are shown in portuguese', function () {
    $this->actingAs($this->user)
        ->post(route('listings.store'), listingPayload(['cep' => '123', 'photos' => [], 'featured_photo' => null]))
        ->assertSessionHasErrors([
            'cep' => 'O CEP deve ter 8 dígitos.',
            'photos' => 'Adicione pelo menos uma foto do imóvel.',
        ]);
});

test('unknown features and nearby places are ignored', function () {
    $this->actingAs($this->user)
        ->post(route('listings.store'), listingPayload(['has_pool' => '1', 'near_beach' => '1']));

    expect(Listing::sole())
        ->features->toBe(['has_garage'])
        ->nearby_places->toBe(['near_park']);
});

test('updating a listing keeps its photos and documents', function () {
    $this->actingAs($this->user)->post(route('listings.store'), listingPayload());
    $listing = Listing::sole();

    $this->actingAs($this->user)
        ->put(route('listings.update', $listing), listingPayload(['photos' => [], 'documents' => [], 'city' => 'Santos']))
        ->assertSessionHasNoErrors();

    expect($listing->fresh())
        ->city->toBe('Santos')
        ->photos->toHaveCount(2)
        ->documents->toHaveCount(1);
});

test('invalid changes to a listing are rejected', function () {
    $listing = Listing::factory()->create(['city' => 'Campinas']);

    $this->actingAs($listing->user)
        ->put(route('listings.update', $listing), listingPayload(['cep' => '1', 'city' => 'Santos']))
        ->assertSessionHasErrors('cep');

    expect($listing->fresh())
        ->city->toBe('Campinas')
        ->status->toBe(Listing::STATUS_APPROVED);
});
