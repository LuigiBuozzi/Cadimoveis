<?php

use App\Models\Listing;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

test('a document cannot be downloaded through another listing', function () {
    Storage::fake('local');
    $listing = Listing::factory()->create();
    $otherListing = Listing::factory()->for($listing->user)->create();
    $document = $otherListing->documents()->create([
        'path' => "listings/{$otherListing->id}/documents/matricula.pdf",
        'original_name' => 'matricula.pdf',
        'size' => 100,
    ]);
    Storage::disk('local')->put($document->path, 'pdf');

    $this->actingAs($listing->user)
        ->get(route('listings.documents.download', [$listing, $document]))
        ->assertNotFound();
});

test('administrators can download the documents of any listing', function () {
    Storage::fake('local');
    $listing = Listing::factory()->create();
    $document = $listing->documents()->create([
        'path' => "listings/{$listing->id}/documents/matricula.pdf",
        'original_name' => 'matricula.pdf',
        'size' => 100,
    ]);
    Storage::disk('local')->put($document->path, 'pdf');

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('listings.documents.download', [$listing, $document]))
        ->assertOk()
        ->assertDownload('matricula.pdf');
});

test('guests are sent to the login page from every listing page', function (string $method, string $route) {
    $listing = Listing::factory()->create();

    $this->{$method}(route($route, $listing))->assertRedirect(route('login'));
})->with([
    ['get', 'listings.show'],
    ['get', 'listings.edit'],
    ['put', 'listings.update'],
    ['delete', 'listings.destroy'],
    ['post', 'listings.approve'],
]);

test('a listing that does not exist returns not found', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('listings.show', 999))
        ->assertNotFound();
});
