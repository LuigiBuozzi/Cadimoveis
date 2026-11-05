<?php

namespace App\Http\Controllers;

use App\Http\Requests\Listings\StoreListingRequest;
use App\Http\Requests\Listings\UpdateListingRequest;
use App\Models\Listing;
use App\Models\ListingDocument;
use App\Models\ListingPhoto;
use App\Models\User;
use App\Support\UploadLimits;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ListingController extends Controller
{
    /**
     * Show the listings of the logged in user.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $listings = $user->listings()
            ->with('featuredPhoto')
            ->latest()
            ->get()
            ->map(fn (Listing $listing) => $listing->toSummary());

        return Inertia::render('listings/index', [
            'listings' => $listings,
        ]);
    }

    /**
     * Show every listing waiting for review, oldest first (administrators only).
     */
    public function review(): Response
    {
        $listings = Listing::query()
            ->where('status', Listing::STATUS_PENDING)
            ->with('featuredPhoto')
            ->oldest('updated_at')
            ->get()
            ->map(fn (Listing $listing) => $listing->toSummary());

        return Inertia::render('listings/review', [
            'listings' => $listings,
        ]);
    }

    /**
     * Search the listings of every user.
     */
    public function search(Request $request): Response
    {
        $listings = Listing::query()
            ->where('status', Listing::STATUS_APPROVED)
            ->with('featuredPhoto')
            ->when($request->string('q')->trim()->toString(), function (Builder $query, string $search) {
                $query->where(function (Builder $query) use ($search) {
                    $query->where('street', 'like', "%{$search}%")
                        ->orWhere('neighborhood', 'like', "%{$search}%")
                        ->orWhere('city', 'like', "%{$search}%");
                });
            })
            ->when($request->string('type')->toString(), fn (Builder $query, string $type) => $query->where('type', $type))
            ->when($request->string('state')->toString(), fn (Builder $query, string $state) => $query->where('state', $state))
            ->when($request->string('city')->toString(), fn (Builder $query, string $city) => $query->where('city', $city))
            // The search form calls a sale "compra" (from the buyer's point of view).
            ->when($request->string('deal')->toString(), fn (Builder $query, string $deal) => $query->where('deal', $deal === 'compra' ? 'venda' : $deal))
            ->when($request->integer('min_price'), fn (Builder $query, int $min) => $query->where('price', '>=', $min))
            ->when($request->integer('max_price'), fn (Builder $query, int $max) => $query->where('price', '<=', $max))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Listing $listing) => $listing->toSummary());

        return Inertia::render('listings/search', [
            'listings' => $listings,
        ]);
    }

    /**
     * Show the form to create a listing.
     */
    public function create(): Response
    {
        return Inertia::render('listings/create', [
            'uploadLimits' => UploadLimits::toArray(),
        ]);
    }

    /**
     * Save a new listing with its photos and documents.
     */
    public function store(StoreListingRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $listing = DB::transaction(function () use ($request, $user) {
            // New listings wait for an administrator before showing up in the search.
            $listing = $user->listings()->create([
                ...$request->listingData(),
                'status' => Listing::STATUS_PENDING,
            ]);

            /** @var array<int, UploadedFile> $photos */
            $photos = $request->file('photos', []);
            /** @var array<int, string|null> $rooms */
            $rooms = $request->input('photo_rooms', []);
            $featured = $request->integer('featured_photo');

            foreach (array_values($photos) as $position => $photo) {
                $listing->photos()->create([
                    'path' => $photo->store("listings/{$listing->id}/photos", config('filesystems.photos_disk')),
                    'room' => ($rooms[$position] ?? null) ?: null,
                    'is_featured' => $position === $featured,
                    'position' => $position,
                ]);
            }

            /** @var array<int, UploadedFile> $documents */
            $documents = $request->file('documents', []);

            foreach ($documents as $document) {
                $listing->documents()->create([
                    'path' => $document->store("listings/{$listing->id}/documents", config('filesystems.documents_disk')),
                    'original_name' => $document->getClientOriginalName(),
                    'size' => $document->getSize(),
                ]);
            }

            return $listing;
        });

        Inertia::flash('success', 'Anúncio enviado! Ele está em análise e aparecerá na pesquisa assim que for aprovado por um administrador.');

        return redirect()->route('listings.show', $listing);
    }

    /**
     * Show a listing.
     */
    public function show(Request $request, Listing $listing): Response
    {
        /** @var User $user */
        $user = $request->user();
        $canUpdate = $user->can('update', $listing);

        $listing->load('photos');

        return Inertia::render('listings/show', [
            'listing' => [
                ...$listing->toSummary(),
                'cep' => $listing->cep,
                ...$listing->only(Listing::ROOMS),
                'features' => $listing->features,
                'nearby_places' => $listing->nearby_places,
                'photos' => $listing->photos->map(fn (ListingPhoto $photo) => [
                    'id' => $photo->id,
                    'url' => $photo->url(),
                    'room' => $photo->room,
                    'is_featured' => $photo->is_featured,
                ]),
                'documents' => $canUpdate
                    ? $listing->documents->map(fn (ListingDocument $document) => [
                        'id' => $document->id,
                        'name' => $document->original_name,
                        'size' => $document->size,
                    ])
                    : [],
            ],
            'can' => [
                'update' => $canUpdate,
                'delete' => $user->can('delete', $listing),
                'approve' => $user->can('approve', $listing),
            ],
        ]);
    }

    /**
     * Show the form to edit a listing.
     */
    public function edit(Listing $listing): Response
    {
        return Inertia::render('listings/create', [
            'uploadLimits' => UploadLimits::toArray(),
            'listing' => [
                ...$listing->only([
                    'id', 'type', 'deal', 'price', 'cep', 'street', 'number', 'neighborhood',
                    'city', 'state', ...Listing::ROOMS,
                ]),
                'features' => $listing->features,
                'nearby_places' => $listing->nearby_places,
            ],
        ]);
    }

    /**
     * Save the changes to a listing.
     */
    public function update(UpdateListingRequest $request, Listing $listing): RedirectResponse
    {
        // Every change has to be reviewed again before it shows up in the search.
        $listing->update([
            ...$request->listingData(),
            'status' => Listing::STATUS_PENDING,
        ]);

        Inertia::flash('success', 'Alterações salvas. O anúncio voltou para análise e aparecerá na pesquisa assim que for aprovado por um administrador.');

        return redirect()->route('listings.show', $listing);
    }

    /**
     * Approve a listing so it shows up in the search.
     */
    public function approve(Listing $listing): RedirectResponse
    {
        $listing->update(['status' => Listing::STATUS_APPROVED]);

        Inertia::flash('success', 'Anúncio aprovado. Ele já aparece na pesquisa.');

        return redirect()->route('listings.show', $listing);
    }

    /**
     * Delete a listing and its files.
     */
    public function destroy(Listing $listing): RedirectResponse
    {
        $listing->delete();

        Storage::disk(config('filesystems.photos_disk'))->deleteDirectory("listings/{$listing->id}");
        Storage::disk(config('filesystems.documents_disk'))->deleteDirectory("listings/{$listing->id}");

        return redirect()->route('listings.index');
    }

    /**
     * Download one of the listing documents.
     */
    public function downloadDocument(Listing $listing, ListingDocument $document): StreamedResponse
    {
        return Storage::disk(config('filesystems.documents_disk'))->download($document->path, $document->original_name);
    }
}
