<?php

use App\Models\Listing;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    config([
        'filesystems.photos_disk' => 'supabase_photos',
        'filesystems.documents_disk' => 'supabase_documents',
    ]);

    Storage::fake('supabase_photos');
    Storage::fake('supabase_documents');
    Storage::fake('public');
    Storage::fake('local');
});

test('photos and documents are saved on the configured disks', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('listings.store'), listingPayload());

    $listing = Listing::sole();

    Storage::disk('supabase_photos')->assertExists($listing->photos->pluck('path')->all());
    Storage::disk('supabase_documents')->assertExists($listing->documents->first()->path);
    expect(Storage::disk('public')->allFiles())->toBeEmpty()
        ->and(Storage::disk('local')->allFiles())->toBeEmpty();
});

test('photo urls come from the configured disk', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post(route('listings.store'), listingPayload());
    $photo = Listing::sole()->featuredPhoto;

    expect($photo->url())->toBe(Storage::disk('supabase_photos')->url($photo->path));
});

test('documents are downloaded from the configured disk', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post(route('listings.store'), listingPayload());
    $listing = Listing::sole();
    $document = $listing->documents->first();

    $response = $this->actingAs($user)
        ->get(route('listings.documents.download', [$listing, $document]))
        ->assertOk()
        ->assertDownload('matricula.pdf');

    expect($response->streamedContent())
        ->toBe(Storage::disk('supabase_documents')->get($document->path));
});

test('deleting a listing removes its files from the configured disks', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post(route('listings.store'), listingPayload());
    $listing = Listing::sole();

    $this->actingAs($user)->delete(route('listings.destroy', $listing));

    expect(Storage::disk('supabase_photos')->allFiles())->toBeEmpty()
        ->and(Storage::disk('supabase_documents')->allFiles())->toBeEmpty();
});

test('the supabase disks point to the photos and documents buckets', function () {
    expect(config('filesystems.disks.supabase_photos'))
        ->driver->toBe('s3')
        ->bucket->toBe('photos')
        ->use_path_style_endpoint->toBeTrue()
        ->and(config('filesystems.disks.supabase_photos.url'))->toEndWith('/storage/v1/object/public/photos')
        ->and(config('filesystems.disks.supabase_documents'))
        ->driver->toBe('s3')
        ->bucket->toBe('documents')
        ->use_path_style_endpoint->toBeTrue()
        ->not->toHaveKey('url');
});

test('files stay in storage/app by default', function () {
    config(['filesystems.photos_disk' => 'public', 'filesystems.documents_disk' => 'local']);
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('listings.store'), listingPayload());
    $listing = Listing::sole();

    Storage::disk('public')->assertExists($listing->photos->pluck('path')->all());
    Storage::disk('local')->assertExists($listing->documents->first()->path);
    expect($listing->featuredPhoto->url())->toContain('/storage/listings/');
});
