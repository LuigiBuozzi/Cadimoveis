<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

/**
 * A valid request to publish a listing, with two photos and one PDF.
 *
 * @return array<string, mixed>
 */
function listingPayload(array $overrides = []): array
{
    return [
        'type' => 'apartamento',
        'deal' => 'aluguel',
        'price' => '2500',
        'cep' => '01310-100',
        'street' => 'Avenida Paulista',
        'number' => '1000',
        'neighborhood' => 'Bela Vista',
        'city' => 'São Paulo',
        'state' => 'SP',
        'bedrooms' => 2,
        'bathrooms' => 1,
        'has_garage' => '1',
        'near_park' => '1',
        'photos' => [
            UploadedFile::fake()->image('fachada.jpg'),
            UploadedFile::fake()->image('sala.jpg'),
        ],
        'photo_rooms' => ['fachada', 'sala-de-estar'],
        'featured_photo' => 1,
        'documents' => [
            UploadedFile::fake()->create('matricula.pdf', 100, 'application/pdf'),
        ],
        ...$overrides,
    ];
}
