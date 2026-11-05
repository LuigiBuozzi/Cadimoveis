<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int $listing_id
 * @property string $path
 * @property string|null $room
 * @property bool $is_featured
 * @property int $position
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['path', 'room', 'is_featured', 'position'])]
class ListingPhoto extends Model
{
    public const array ROOMS = [
        'quarto', 'sala-de-estar', 'cozinha', 'fundo', 'fachada', 'sacada',
        'banheiro', 'lavabo', 'corredor',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Listing, $this>
     */
    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    /**
     * The public URL of the photo.
     */
    public function url(): string
    {
        return Storage::disk(config('filesystems.photos_disk'))->url($this->path);
    }
}
