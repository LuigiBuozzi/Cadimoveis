<?php

namespace App\Models;

use Database\Factories\ListingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $type
 * @property string $status
 * @property string|null $deal
 * @property int|null $price Price in whole reais (monthly rent for "aluguel").
 * @property string $cep
 * @property string $street
 * @property string $number
 * @property string|null $neighborhood
 * @property string $city
 * @property string $state
 * @property int $bedrooms
 * @property int $suites
 * @property int $kitchens
 * @property int $laundry_rooms
 * @property int $living_rooms
 * @property int $dining_rooms
 * @property int $bathrooms
 * @property int $half_bathrooms
 * @property int $pantries
 * @property list<string> $features
 * @property list<string> $nearby_places
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'type', 'status', 'deal', 'price', 'cep', 'street', 'number', 'neighborhood', 'city', 'state',
    'bedrooms', 'suites', 'kitchens', 'laundry_rooms', 'living_rooms',
    'dining_rooms', 'bathrooms', 'half_bathrooms', 'pantries',
    'features', 'nearby_places',
])]
class Listing extends Model
{
    /** @use HasFactory<ListingFactory> */
    use HasFactory;

    /** Waiting for an administrator to review it. Hidden from the search. */
    public const string STATUS_PENDING = 'pending';

    /** Reviewed by an administrator and visible in the search. */
    public const string STATUS_APPROVED = 'approved';

    public const array DEALS = ['aluguel', 'venda'];

    public const array TYPES = ['casa-terrea', 'apartamento', 'sobrado', 'imovel-rural'];

    public const array ROOMS = [
        'bedrooms', 'suites', 'kitchens', 'laundry_rooms', 'living_rooms',
        'dining_rooms', 'bathrooms', 'half_bathrooms', 'pantries',
    ];

    public const array FEATURES = [
        'has_garden', 'has_electric_fence', 'has_paved_street',
        'has_garage', 'has_alarm', 'has_barbecue',
    ];

    public const array NEARBY_PLACES = [
        'near_hospital', 'near_college', 'near_state_school',
        'near_municipal_school', 'near_private_school', 'near_supermarket',
        'near_market', 'near_convenience_store', 'near_park', 'near_bakery',
        'near_pharmacy', 'near_shopping_mall',
    ];

    public const array STATES = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT',
        'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO',
        'RR', 'SC', 'SP', 'SE', 'TO',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'features' => 'array',
            'nearby_places' => 'array',
        ];
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<ListingPhoto, $this>
     */
    public function photos(): HasMany
    {
        return $this->hasMany(ListingPhoto::class)->orderBy('position');
    }

    /**
     * The photo used as the main image in search results.
     *
     * @return HasOne<ListingPhoto, $this>
     */
    public function featuredPhoto(): HasOne
    {
        return $this->hasOne(ListingPhoto::class)->where('is_featured', true);
    }

    /**
     * @return HasMany<ListingDocument, $this>
     */
    public function documents(): HasMany
    {
        return $this->hasMany(ListingDocument::class);
    }

    /**
     * The data shown on listing cards (search results and "my listings").
     *
     * @return array<string, mixed>
     */
    public function toSummary(): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'status' => $this->status,
            'deal' => $this->deal,
            'price' => $this->price,
            'street' => $this->street,
            'number' => $this->number,
            'neighborhood' => $this->neighborhood,
            'city' => $this->city,
            'state' => $this->state,
            'bedrooms' => $this->bedrooms,
            'suites' => $this->suites,
            'bathrooms' => $this->bathrooms,
            'featured_photo_url' => $this->featuredPhoto?->url(),
        ];
    }
}
