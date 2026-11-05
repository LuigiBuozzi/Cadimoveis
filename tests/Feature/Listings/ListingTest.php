<?php

use App\Models\Listing;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    Storage::fake('local');
});

test('users can publish a listing with photos and documents', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('listings.store'), listingPayload());

    $listing = Listing::sole();
    $response->assertRedirect(route('listings.show', $listing));

    $this->actingAs($user)
        ->get(route('listings.show', $listing))
        ->assertInertia(fn ($page) => $page
            ->where('listing.status', Listing::STATUS_PENDING)
            ->hasFlash('success', 'Anúncio enviado! Ele está em análise e aparecerá na pesquisa assim que for aprovado por um administrador.'));

    expect($listing->user_id)->toBe($user->id)
        ->and($listing->status)->toBe(Listing::STATUS_PENDING)
        ->and($listing->deal)->toBe('aluguel')
        ->and($listing->price)->toBe(2500)
        ->and($listing->cep)->toBe('01310100')
        ->and($listing->bedrooms)->toBe(2)
        ->and($listing->features)->toBe(['has_garage'])
        ->and($listing->nearby_places)->toBe(['near_park'])
        ->and($listing->photos)->toHaveCount(2)
        ->and($listing->featuredPhoto?->room)->toBe('sala-de-estar')
        ->and($listing->documents)->toHaveCount(1);

    Storage::disk('public')->assertExists($listing->photos->pluck('path')->all());
    Storage::disk('local')->assertExists($listing->documents->first()->path);
});

test('a listing needs photos and a featured photo', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('listings.store'), listingPayload(['photos' => [], 'featured_photo' => null]))
        ->assertSessionHasErrors(['photos', 'featured_photo']);

    $this->actingAs($user)
        ->post(route('listings.store'), listingPayload(['featured_photo' => 5]))
        ->assertSessionHasErrors('featured_photo');

    expect(Listing::count())->toBe(0);
});

test('documents must be pdf files', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('listings.store'), listingPayload([
            'documents' => [UploadedFile::fake()->create('notas.txt', 10, 'text/plain')],
        ]))
        ->assertSessionHasErrors('documents.0');
});

test('users see their own listings on the listings page', function () {
    $user = User::factory()->create();
    $own = Listing::factory()->for($user)->create();
    $other = Listing::factory()->create();

    $this->actingAs($user)
        ->get(route('listings.index'))
        ->assertInertia(fn ($page) => $page
            ->component('listings/index')
            ->has('listings', 1)
            ->where('listings.0.id', $own->id));
});

test('other users can find a listing in the search', function () {
    $listing = Listing::factory()->create(['city' => 'Campinas', 'state' => 'SP', 'type' => 'sobrado']);
    Listing::factory()->create(['city' => 'Curitiba', 'state' => 'PR', 'type' => 'sobrado']);

    $this->actingAs(User::factory()->create())
        ->get(route('listings.search', ['state' => 'SP', 'city' => 'Campinas', 'type' => 'sobrado']))
        ->assertInertia(fn ($page) => $page
            ->component('listings/search')
            ->where('listings.total', 1)
            ->where('listings.data.0.id', $listing->id));
});

test('other users can view a listing but not change it', function () {
    $listing = Listing::factory()->create();
    $visitor = User::factory()->create();

    $this->actingAs($visitor)
        ->get(route('listings.show', $listing))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('can.update', false)
            ->where('listing.documents', []));

    $this->actingAs($visitor)->get(route('listings.edit', $listing))->assertForbidden();
    $this->actingAs($visitor)->put(route('listings.update', $listing), listingPayload())->assertForbidden();
    $this->actingAs($visitor)->delete(route('listings.destroy', $listing))->assertForbidden();

    expect($listing->fresh())->not->toBeNull();
});

test('other users cannot download the documents of a listing', function () {
    $listing = Listing::factory()->create();
    $document = $listing->documents()->create([
        'path' => 'listings/1/documents/matricula.pdf',
        'original_name' => 'matricula.pdf',
        'size' => 100,
    ]);
    Storage::disk('local')->put($document->path, 'pdf');

    $this->actingAs(User::factory()->create())
        ->get(route('listings.documents.download', [$listing, $document]))
        ->assertForbidden();

    $this->actingAs($listing->user)
        ->get(route('listings.documents.download', [$listing, $document]))
        ->assertOk();
});

test('owners can update their listing', function () {
    $listing = Listing::factory()->create(['type' => 'sobrado']);

    $this->actingAs($listing->user)
        ->put(route('listings.update', $listing), listingPayload(['type' => 'imovel-rural']))
        ->assertRedirect(route('listings.show', $listing));

    expect($listing->fresh())
        ->type->toBe('imovel-rural')
        ->status->toBe(Listing::STATUS_PENDING);
});

test('administrators can update and delete any listing', function () {
    $listing = Listing::factory()->create(['type' => 'sobrado']);
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get(route('listings.edit', $listing))->assertOk();

    $this->actingAs($admin)
        ->put(route('listings.update', $listing), listingPayload(['type' => 'apartamento']))
        ->assertRedirect(route('listings.show', $listing));

    expect($listing->fresh()->type)->toBe('apartamento');

    $this->actingAs($admin)
        ->delete(route('listings.destroy', $listing))
        ->assertRedirect(route('listings.index'));

    expect($listing->fresh())->toBeNull();
});

test('owners can delete their listing and its files', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post(route('listings.store'), listingPayload());
    $listing = Listing::sole();
    $photoPaths = $listing->photos->pluck('path')->all();
    $documentPath = $listing->documents->first()->path;

    $this->actingAs($user)
        ->delete(route('listings.destroy', $listing))
        ->assertRedirect(route('listings.index'));

    expect(Listing::count())->toBe(0)
        ->and($photoPaths)->toHaveCount(2);
    Storage::disk('public')->assertMissing($photoPaths);
    Storage::disk('local')->assertMissing($documentPath);
});

test('listings under review are hidden from the search', function () {
    $pending = Listing::factory()->pending()->create(['city' => 'Campinas']);
    $approved = Listing::factory()->create(['city' => 'Campinas']);

    $this->actingAs(User::factory()->create())
        ->get(route('listings.search', ['q' => 'Campinas']))
        ->assertInertia(fn ($page) => $page
            ->where('listings.total', 1)
            ->where('listings.data.0.id', $approved->id));

    $this->actingAs($pending->user)
        ->get(route('listings.index'))
        ->assertInertia(fn ($page) => $page
            ->where('listings.0.id', $pending->id)
            ->where('listings.0.status', Listing::STATUS_PENDING)
            ->where('pendingReviewCount', null));
});

test('only the owner and administrators can open a listing under review', function () {
    $listing = Listing::factory()->pending()->create();

    $this->actingAs(User::factory()->create())
        ->get(route('listings.show', $listing))
        ->assertForbidden();

    $this->actingAs($listing->user)
        ->get(route('listings.show', $listing))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('can.approve', false));

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('listings.show', $listing))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('can.approve', true));
});

test('changing an approved listing sends it back to review', function () {
    $listing = Listing::factory()->create();

    $this->actingAs($listing->user)
        ->put(route('listings.update', $listing), listingPayload());

    expect($listing->fresh()->status)->toBe(Listing::STATUS_PENDING);

    $this->actingAs(User::factory()->create())
        ->get(route('listings.search'))
        ->assertInertia(fn ($page) => $page->where('listings.total', 0));
});

test('administrators see listings waiting for review and can approve them', function () {
    $listing = Listing::factory()->pending()->create();
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('listings.review'))
        ->assertInertia(fn ($page) => $page
            ->component('listings/review')
            ->has('listings', 1)
            ->where('listings.0.id', $listing->id)
            ->where('pendingReviewCount', 1));

    $this->actingAs($admin)
        ->post(route('listings.approve', $listing))
        ->assertRedirect(route('listings.show', $listing));

    expect($listing->fresh()->status)->toBe(Listing::STATUS_APPROVED);

    $this->actingAs(User::factory()->create())
        ->get(route('listings.search'))
        ->assertInertia(fn ($page) => $page->where('listings.data.0.id', $listing->id));
});

test('owners cannot approve their own listing', function () {
    $listing = Listing::factory()->pending()->create();

    $this->actingAs($listing->user)
        ->post(route('listings.approve', $listing))
        ->assertForbidden();

    expect($listing->fresh()->status)->toBe(Listing::STATUS_PENDING);
});

test('a listing needs a deal type and a price', function () {
    $this->actingAs(User::factory()->create())
        ->post(route('listings.store'), listingPayload(['deal' => 'troca', 'price' => '']))
        ->assertSessionHasErrors(['deal', 'price']);

    expect(Listing::count())->toBe(0);
});

test('the search filters by rent or sale and by price', function () {
    $rent = Listing::factory()->create(['deal' => 'aluguel', 'price' => 2500]);
    $cheapSale = Listing::factory()->create(['deal' => 'venda', 'price' => 300000]);
    $expensiveSale = Listing::factory()->create(['deal' => 'venda', 'price' => 900000]);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('listings.search', ['deal' => 'aluguel']))
        ->assertInertia(fn ($page) => $page
            ->where('listings.total', 1)
            ->where('listings.data.0.id', $rent->id));

    // The search form calls a sale "compra".
    $this->actingAs($user)
        ->get(route('listings.search', ['deal' => 'compra', 'max_price' => 500000]))
        ->assertInertia(fn ($page) => $page
            ->where('listings.total', 1)
            ->where('listings.data.0.id', $cheapSale->id));

    $this->actingAs($user)
        ->get(route('listings.search', ['min_price' => 500000]))
        ->assertInertia(fn ($page) => $page
            ->where('listings.total', 1)
            ->where('listings.data.0.id', $expensiveSale->id));
});

test('only administrators can open the approvals page', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('listings.review'))
        ->assertForbidden();

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('listings.review'))
        ->assertOk();
});
