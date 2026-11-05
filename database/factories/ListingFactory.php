<?php

namespace Database\Factories;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Listing>
 */
class ListingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => fake()->randomElement(Listing::TYPES),
            'status' => Listing::STATUS_APPROVED,
            'deal' => 'venda',
            'price' => fake()->numberBetween(150, 2000) * 1000,
            'cep' => fake()->numerify('########'),
            'street' => fake()->streetName(),
            'number' => (string) fake()->buildingNumber(),
            'neighborhood' => fake()->word(),
            'city' => fake()->city(),
            'state' => fake()->randomElement(Listing::STATES),
            'bedrooms' => fake()->numberBetween(1, 4),
            'bathrooms' => fake()->numberBetween(1, 3),
            'features' => [],
            'nearby_places' => [],
        ];
    }

    /**
     * Indicate that the listing is waiting for review.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Listing::STATUS_PENDING,
        ]);
    }
}
